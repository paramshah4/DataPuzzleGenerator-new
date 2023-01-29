


(function ($) {
	$.fn.bstreetable = function (options) {
		$window = window;

		var element = this;
		var $container;
		var idCounterVraj = 1;

		var settings = {
			container: window,
			data: [],
			extfield: [],
			nodeaddEnable: true,
			maxlevel: 9,
			nodeaddCallback: function (data, callback) { },
			noderemoveCallback: function (data, callback) { },
			nodeupdateCallback: function (data, callback) { },
			customalert: function (msg) {
				alert(msg);
			},
			customconfirm: function (msg) {
				return confirm(msg);
			},
			customSplitIdPrompt: function (msg) {
				return prompt(msg);
			},
			customcatDialogueBox: function (msg) {

			},
			text: {
				NodeDeleteText: "Are You Sure To Delete This Node?"
			}
		};

		var TREENODECACHE = "treenode";

		var language = {};
		language.addchild = "Add A Child Node";

		//Merging the data to the setting['data'] :- Merging of two objects in jQuery:
		if (options) {
			$.extend(settings, options);
		}

		function generateOptionString(attr, rowname, parentinfoarray) {
			var attributes_dropdown = [];
			for (var key in attr) {
				attributes_dropdown.push(key);
			}

			if (rowname.includes("NOT")) {
				if (parentinfoarray) {
					parentinfoarray.pop();

					// for (var i = 0; i < parentinfoarray.length; i++) {
					// 	if (!parentinfoarray[i].includes("NOT")) {
					// 		var attr = parentinfoarray[i].split("=")[0].trim();
					// 		attr_index = attributes_dropdown.indexOf(attr);
					// 		// attributes_dropdown.splice(attr_index, 1);

					// 	}
					// }

				}
				var generatedRes = ""
				// for (var key in attr) {
				// 	generatedRes += "<option value='" + key + "'>" + key + "</option>";
				// }
				for (var i = 0; i < attributes_dropdown.length; i++) {
					generatedRes += "<option value='" + attributes_dropdown[i] + "'>" + attributes_dropdown[i] + "</option>";
				}
			}
			else {
				if (parentinfoarray) {
					parentinfoarray.pop();

					// for (var i = 0; i < parentinfoarray.length; i++) {
					// 	if (!parentinfoarray[i].includes("NOT")) {
					// 		var attr = parentinfoarray[i].split("=")[0].trim();
					// 		attr_index = attributes_dropdown.indexOf(attr);
					// 		attributes_dropdown.splice(attr_index, 1);

					// 	}
					// }

				}
				skipattr = rowname.split("=")[0].trim();
				var generatedRes = ""

				for (var i = 0; i < attributes_dropdown.length; i++) {
					if (attributes_dropdown[i] != skipattr) {
						generatedRes += "<option vctalue='" + attributes_dropdown[i] + "'>" + attributes_dropdown[i] + "</option>";

					}
				}
			}

			return generatedRes;
		}

		$container = (settings.container === undefined ||
			settings.container === window) ? $window : $(settings.container);

		var dom_addFirstLevel = $("<div class='tt-operation m-b-sm'></div>").append( $("<button class='btn btn-primary btn-sm' id='import_tree' style='margin-left:0px'><i class='fa fa-upload'></i>&nbsp;Upload Existing Tree</button>"), $("<input type='file' id='uploadedTreeData' style='display: none'>"), $("<button class='btn btn-primary btn-sm' id='clear_generated_tree' style='float: right'><i class='fa fa-remove'></i>&nbsp;Clear Tree</button>"));

		var dom_table = $("<div class='tt-body'></div>");
		var dom_header = $("<div class='tt-header'></div>");

		renderHeader(dom_header);
		element.html('').append(dom_addFirstLevel).append(dom_header);

		var treeData = {};

		function loadBasicData() {
			for (var i = 0; i < settings.data.length; i++) {
				var row = settings.data[i];
				if (!row.pid) {
					generateTreeNode(dom_table, row, 1);
					treeData[row.id] = row;
				}
			}
		}

		loadBasicData();
		element.append(dom_table);

		$('#clear_generated_tree').click(function () {
			if (settings.customconfirm("Do you want to reset the tree?")) {
				dom_table.empty();
				idCounterVraj = 1;
				for (var entry in treeData) {
					delete treeData[entry];
				}
				loadBasicData();
			}
		});

		$('#import_tree').click(function () {
			var fileupload = $("#uploadedTreeData");
			fileupload.click();

			fileupload.change(function (e1) {
				if ($(this).val().length == 0) {
					return;
				} else {
					idCounterVraj = 1;
					for (var entry in treeData) {
						delete treeData[entry];
					}
				}

				console.log("SOMETHING CHANGED!");
				e1.stopImmediatePropagation();
				dom_table.empty();

				var file = $(this).prop('files')[0];
				var fReader = new FileReader();

				fReader.onload = function (e) {
					var fileContent = JSON.parse(e.target.result);
					renderDataFromFile(fileContent);
					fileupload.val("");
				}
				fReader.readAsText(file);
			});
		});

		function renderDataFromFile(content) {
			setTargetVariable(content["target_variable"]["name"], content["target_variable"]["distribution"]);
			var holdTargetVariable;
			var queue = [];
			var maxSoFar = -1;

			for (var x in content) {
				var row = content[x];
				if (row.pid == 0) {
					if (row.id > maxSoFar) {
						maxSoFar = row.id;
					}
					queue.push(row.id);
					generateTreeNode(dom_table, row, 1);
					treeData[row.id] = row;
				}
			}

			while (queue.length > 0) {
				var currId = queue.pop();

				for (var i in content) {
					var row = content[i];

					if (row.pid == currId) {
						var valueOfNode = row.name.split(" ").slice(0, -2).join(" ");
						$("#" + "selectId_" + row.pid).val(valueOfNode);

						if (row.id > maxSoFar) {
							maxSoFar = row.id;
						}

						var importantUL;

						var allClassLevels = $(".class-level");
						var allULs = allClassLevels.find($(".class-level-ul"));

						for (var x = 0; x < allULs.length; x++) {
							if (($(allULs[x]).find('[data-id=' + currId + ']'))["length"] > 0) {
								importantUL = $(allULs[x]);
								break;
							}
						}

						var curElement = importantUL.closest(".class-level");
						var curLevel = importantUL.attr("data-level") - 0 + 1;

						generateTreeNode(curElement, row, curLevel);
						queue.push(row.id);
						treeData[row.id] = row;
					}
				}
			}
			idCounterVraj = maxSoFar;
			treeData["isSaved"] = true;
		}

		element.delegate(".j-expend", "click", function (event) {
			if (event.target.classList[0] == "fa") {
				var treenode = treeData[$(this).attr('data-id')];
				toggleicon($(this));
				if ($(this).parent().attr('data-loaded')) {
					toggleExpendStatus($(this), treenode);
				}
				else {
					loadNode($(this), treenode);
				}
			}
		});

		element.delegate(".j-addClass", "click", function () {
			idCounterVraj += 1;
			var curElement = $(".tt-body");
			var row = { id: "", name: "", pid: 0 };
			var curLevel = 1;
			generateTreeNode(curElement, row, curLevel, true);
		});

		element.delegate(".j-remove", "click", function (event) {
			var parentDom = $(this).parents(".class-level-ul");
			var that = $(this);
			console.log("BEFORE DELETION: ", treeData);

			if (settings.customconfirm(settings.text.NodeDeleteText)) {
				settings.noderemoveCallback(that.parents(".class-level-ul").attr("data-id"), function () {
					var ulLevelInfo = that.parents(".class-level-ul");
					var ownId = parseInt(ulLevelInfo.attr("data-id"));

					var entireBranch = [ownId];

					while (entireBranch.length > 0) {
						var currId = entireBranch.pop();

						for (var key in treeData) {
							if (treeData[key]["pid"] == currId) {
								entireBranch.push(treeData[key]["id"]);
								delete treeData[key];
							}
						}
						delete treeData[currId];
					}

					that.parents(".class-level-ul").parent().remove();
				});
			}
			treeData["isSaved"] = false;
			console.log("AFTER DELETION: ", treeData);

		});

		element.delegate(".j-addChild", "click", function () {
			idCounterVraj += 1;

			var curElement = $(this).closest(".class-level");
			var requiredInput = curElement.find(".form-control*[required]");
			var hasError = false;
			requiredInput.each(function () {
				if ($(this).val() == "") {
					$(this).parent().addClass("has-error");
					hasError = true;
				}
			});
			if (!hasError) {
				var pid = curElement.find(".j-expend").attr("data-id");
				var curLevel = $(this).parents(".class-level-ul").attr("data-level") - 0 + 1;

				var row = { id: "", name: "", pid: pid };
				generateTreeNode(curElement, row, curLevel);
			}

		});

		element.delegate(".form-control", "focus", function () {
			$(this).parent().removeClass("has-error");
		});

		element.delegate(".form-control", "blur", function () {
			var curElement = $(this);
			var data = {};
			var data_kendo = [];

			//data.id = curElement.parent().parent().attr("data-id");

			var parentUl = curElement.closest(".class-level-ul");

			data.id = idCounterVraj;
			data.pid = parentUl.attr("data-pid");
			data.ischecked = 0;

			//data.pinnercode = curElement.parents(".class-level-"+(parentUl.attr("data-level")-1)).children("ul").attr("data-innercode");
			//Flow: Adding Node -> Will call callback function -> Will again call callback function (I guess with updated ID)

			parentUl.find(".form-control").each(function () {
				data[$(this).attr("name")] = $(this).val();
			});

			var isSelect = false;
			var isDistribution = false;

			//to check whether curElement is select or not:
			if (curElement.attr("id")) {
				isSelect = curElement.attr("id").includes('selectId');
				isDistribution = curElement.attr("id").includes('distributionId');
			}

			if (isSelect) {
				if (data.attribute == "Distribution") {
					/*
					LOGIC FOR WHAT SHOULD HAPPEN WHEN DISTRIBUTION (FROM DROPDOWN) IS SELECTED!
					STEPS:
					
					1) Input text will be enabled.
					2) And treedata will be updated. Selected node will have 'distribution' field in JSON.
					
					*/
					if (parentUl.parent().find(".class-level").length > 0) {
						settings.customalert(data.name + " cannot be leaf node as it has child(ren).");
					} else {
						var distributionInputElement = $($($(parentUl.get(0)["children"]).get(2)).get(0)["children"]);
						distributionInputElement.prop('disabled', false);

						//Following snippet is added to get the id while updating the data. Otherwise it will take the latest idCounterVraj.
						data.id = parseInt(curElement.parent().parent().attr("data-id"));

						treeData[data.id]["distribution"] = "";
						treeData["isSaved"] = false;
					}
				} else {

					//BEFORE: Once children are added, disable the distribution field.
					//BEFORE: distributionInputElement.prop('disabled', true);
					//AFTER: By default input is disabled, if you click on distribution then and only then it will be activated!

					if (!document.getElementById("hint_div")) {
						settings.customalert("Select Target Variable First!");
						return;
					}

					totalSubCat = [];
					var currentAttr = settings.availableAttributes[data.attribute];
					console.log("currentAttr details");
					console.log(currentAttr);

					if (currentAttr['type'] == "categorical") {
						//var data_kendo = [];
						var text_field = $(this).closest(".class-level-ul").find("li input").attr("data-oldval");
						// console.log("text field", text_field);
						var curLevel = $(this).parents(".class-level-ul").attr("data-level") - 0 + 1;
						parentinfo = [];
						var x = $(this).parents(".class-level-ul");
						var data_pid = x.attr("data-pid");
						for (var q = curLevel - 1; q > 1; q--) {
							var ul = $(`ul[data-id='${data_pid}']`);
							var text = ul.find("li input").attr("data-oldval");
							parentinfo.push(text);
							var data_pid = ul.attr("data-pid");
						}
						console.log("text field", text_field)
						console.log("parents of the text", parentinfo);
						if(parentinfo.length==0 || ((parentinfo.length==1 && parentinfo[0]=="Root" ) || !text_field.includes("NOT")) )
						{
							console.log("inside !parentsinfo")
							for (var x = 0; x < currentAttr["values"].length; x++) {
								data_kendo.push(currentAttr["values"][x]);
							}
							data_kendo.push("All");
						}
						else{
							//check for the parents
							if(text_field.includes("NOT"))
							{
								var attr_skip=[];
								attr_skip.push(text_field.split("NOT")[1].trim());
								for (var i =0; i< parentinfo.length; i++)
								{
									if(parentinfo[i].includes("NOT"))
									{
										attr_skip.push(parentinfo[i].split("NOT")[1].trim())
									}
								}
								for (var x = 0; x < currentAttr["values"].length; x++) 
								{
									if(!attr_skip.includes(currentAttr["values"][x]))
									{
										data_kendo.push(currentAttr["values"][x]);
									}
									
								}
								if(data_kendo.length==currentAttr["values"].length)
								{
									data_kendo.push("All");
								}
							}
							
						}
						var x = document.getElementById("dropdownlist_div");
						x.style.display = "block";
						$("#dropdownlist").kendoDropDownList({
							dataSource: data_kendo,
							select: onSelect.bind(this)
						});

						function onSelect(e) {
							console.log("inside onSelect");
							if (e.dataItem) {
								var dataItem = e.dataItem;
								if (dataItem != "All") {
									totalSubCat = [data.attribute + " = " + dataItem, data.attribute + " = NOT " + dataItem]
									console.log("totalSubCat");
									console.log(totalSubCat);
								}
								else {
									for (var x = 0; x < currentAttr["values"].length; x++) {
										totalSubCat.push(data.attribute + " = " + currentAttr["values"][x]);
									}
									console.log(totalSubCat);
								}

							} else {
								kendoConsole.log("event :: select");
							}

							for (var eachcat = 0; eachcat < totalSubCat.length; eachcat++) {
								console.log("to make the rows");
								idCounterVraj += 1;
								var curElement = $(this).closest(".class-level");
								console.log("curElement info");
								console.log(curElement);
								var requiredInput = curElement.find(".form-control*[required]");
								var pid = curElement.find(".j-expend").attr("data-id");
								var curLevel = $(this).parents(".class-level-ul").attr("data-level") - 0 + 1;

								parentinfo = [];
								var x = $(this).parents(".class-level-ul");
								var y = x.find("li input").attr("data-oldval");
								parentinfo.push(y);

								var data_pid = x.attr("data-pid");


								for (var q = curLevel - 1; q > 1; q--) {
									var ul = $(`ul[data-id='${data_pid}']`);
									var text = ul.find("li input").attr("data-oldval");
									parentinfo.push(text);
									var data_pid = ul.attr("data-pid");
								}
								var row = { id: idCounterVraj, name: totalSubCat[eachcat], parentinfo, pid: pid };

								console.log(curElement);
								console.log("row details");
								console.log(row);
								console.log(curLevel);

								generateTreeNode(curElement, row, curLevel);
								treeData[idCounterVraj] = { "id": idCounterVraj, "name": totalSubCat[eachcat], "pid": parseInt(pid) }
							}
							var x = document.getElementById("dropdownlist_div");
							console.log("i am ging to block");
							x.style.display = "none";

						};

						console.log("i am here");

					} else {
						var userInpSplit = settings.customSplitIdPrompt("Enter Split for " + data.attribute);
						if (!userInpSplit) {
							return;
						}
						totalSubCat = [data.attribute + " >= " + userInpSplit, data.attribute + " < " + userInpSplit];
					}

					for (var eachcat = 0; eachcat < totalSubCat.length; eachcat++) {
						console.log("to make the rows");
						idCounterVraj += 1;

						var curElement = $(this).closest(".class-level");

						var requiredInput = curElement.find(".form-control*[required]");
						var pid = curElement.find(".j-expend").attr("data-id");
						var curLevel = $(this).parents(".class-level-ul").attr("data-level") - 0 + 1;
						//alert("Current Level : " + curLevel);

						var row = { id: idCounterVraj, name: totalSubCat[eachcat], pid: pid };
						console.log(curElement);
						console.log(row);
						console.log(curLevel);

						generateTreeNode(curElement, row, curLevel);
						treeData[idCounterVraj] = { "id": idCounterVraj, "name": totalSubCat[eachcat], "pid": parseInt(pid) }
					}
				}
				/*
					var parentDom = $(this).parents(".class-level-ul");
					var isRemoveAble = false;
					if(parentDom.attr("data-loaded")=="true"){
					if(parentDom.parent().find(".class-level").length>0){
				*/
			}
			else if (!isSelect && !isDistribution && !curElement.attr("data-oldval")) {
				console.log("Adding Node");
				console.log("jQuery: ", data);

				settings.nodeaddCallback(data, function (_data) {
					if (_data) {
						console.log("NOT SURE ABOUT THE ORDER: ", _data);

						//To populate data-id to li and ul (which are parent and parent's parent of textbox.)
						curElement.parent().attr("data-id", _data.id);
						curElement.parent().parent().attr("data-id", _data.id);
						curElement.attr("data-oldval", curElement.val());
						treeData["isSaved"] = false;
						treeData[_data.id] = { "id": _data.id, "name": _data.name, "pid": parseInt(_data.pid) }
					}
				});
			}
			else if (!isSelect && !isDistribution && curElement.attr("data-oldval") != curElement.val()) {
				console.log("Updating Node");

				//Following snippet is added to get the id while updating the data. Otherwise it will take the latest idCounterVraj.

				console.log("BEFORE: ", data);
				data.id = parseInt(curElement.parent().parent().attr("data-id"));
				console.log("AFTER: ", data);

				//var tempArr = curElement.parent().parent().children().get(1)['firstChild'];
				//console.log($(tempArr).val());

				settings.nodeupdateCallback(data, function () {
					treeData[data.id] = { "id": data.id, "name": data.name, "pid": parseInt(data.pid) }
					treeData["isSaved"] = false;
					curElement.attr("data-oldval", curElement.val());
				});
			} else if (isDistribution) {

				//Logic for distribution data handling.
				//Following snippet is added to get the id while updating the data. Otherwise it will take the latest idCounterVraj.

				console.log("DISTRIBUTION BEFORE: ", data);
				data.id = parseInt(curElement.parent().parent().attr("data-id"));
				console.log("DISTRIBUTION AFTER: ", data);

				treeData[data.id]["distribution"] = data.distributionShare;
				treeData["isSaved"] = false;
			}

			console.log("ENTIRE TREE: ", treeData);
		});

		function renderHeader(_dom_header) {
			var dom_row = $('<div></div>');
			dom_row.append($("<span class='maintitle'></span>").text(settings.maintitle));
			dom_row.append($("<span></span>"));

			//Mostly will get ignored just because no extra fields. EXTFIELDS: Extra fields. Between Attribute and Operation

			for (var j = 0; j < settings.extfield.length; j++) {
				var column = settings.extfield[j];
				$("<span></span>").css("min-width", "166px").text(column.title).appendTo(dom_row);
			}

			dom_row.append($("<span style='margin-left: 100px' class='textalign-center'>Distribution OR Operation</span>"));
			_dom_header.append(dom_row);
		}

		function generateColumn(row, extfield) {
			var generatedCol;
			switch (extfield.type) {
				case "input": generatedCol = $("<input type='text' class='form-control input-sm'/>").val(row[extfield.key]).attr("data-oldval", row[extfield.key]).attr("name", extfield.key); break;
				case "select": generatedCol = $("<select id='selectId_" + row.id + "' style='margin-left:215px' class='form-control' name='attribute'>" +
					generateOptionString(settings.availableAttributes, row.name, row.parentinfo) + "<option value='Distribution'> Distribution </option>" + "</select>");
					break;
				default: generatedCol = $("<span></span>").text(row[extfield.key]); break;
			}
			return generatedCol;
		}

		function toggleicon(toggleElement) {
			var _element = toggleElement.find(".fa");
			if (_element.hasClass("fa-plus")) {
				_element.removeClass("fa-plus").addClass("fa-minus");
				toggleElement.parent().addClass("selected");
			} else {
				_element.removeClass("fa-minus").addClass("fa-plus");
				toggleElement.parent().removeClass("selected")
			}
		}
		function toggleExpendStatus(curElement) {
			if (curElement.find(".fa-minus").length > 0) {
				curElement.parent().parent().find(".class-level").removeClass("rowhidden");
			}
			else {
				curElement.parent().parent().find(".class-level").addClass("rowhidden");
			}

		}
		function loadNode(loadElement, parentNode) {
			var curElement = loadElement.parent().parent();
			var curLevel = loadElement.parent().attr("data-level") - 0 + 1;
			if (parentNode && parentNode.id) {
				for (var i = 0; i < settings.data.length; i++) {
					var row = settings.data[i];
					//render first level row while row.pid equals 0 or null or undefined
					if (row.pid == parentNode.id) {
						generateTreeNode(curElement, row, curLevel);
						treeData[row.id] = row;
					}
				}
			}
			loadElement.parent().attr('data-loaded', true);
		}

		function generateTreeNode(curElement, row, curLevel, isPrepend) {
			var dom_row = $('<div class="class-level class-level-' + curLevel + '"></div>');
			var dom_ul = $('<ul class="class-level-ul"></ul>');

			dom_ul.attr("data-pid", row.pid).attr("data-level", curLevel).attr("data-id", row.id);

			if (curLevel - 0 >= settings.maxlevel) {
				$('<li class="j-expend"></li>').append('<label class="fa p-xs"></label>').append($("<input type='text' class='form-control input-sm' disabled required/>").attr("data-oldval", row['name']).val(row['name']).attr("name", "name")).attr('data-id', row.id).appendTo(dom_ul);
				dom_ul.attr("data-loaded", true);
			}
			else {
				$('<li class="j-expend"></li>').append('<label class="fa fa-plus p-xs"></label>').append($("<input type='text' class='form-control input-sm' disabled required/>").attr("data-oldval", row['name']).val(row['name']).attr("name", "name")).attr('data-id', row.id).appendTo(dom_ul);
			}

			for (var j = 0; j < settings.extfield.length; j++) {
				var colrender = settings.extfield[j];
				var coltemplate = generateColumn(row, colrender);
				$('<li></li>').attr("data-id", row.id).html(coltemplate).appendTo(dom_ul);
			}

			if (settings.nodeaddEnable) {
				if (curLevel - 0 >= settings.maxlevel) {
					$("<li></li>").attr("data-id", row.id).appendTo(dom_ul);
				}
				else {
					//$("<li></li>").append($('<button class="btn btn-outline btn-sm j-addChild"><i class="fa fa-plus"></i>'+language.addchild +'</button>').attr("data-id",row.id)).appendTo(dom_ul);

					$("<li></li>").append($("<input id='distributionId_" + row.id + "'  name='distributionShare' type='text' class='form-control input-sm form-distribution' disabled/>").attr("data-id", row.id)).appendTo(dom_ul);
				}

			}

			dom_ul.append($("<li><i class='fa fa-remove j-remove'></i></li>"));
			dom_row.append(dom_ul);

			if (isPrepend) {
				curElement.prepend(dom_row);
			}
			else {
				curElement.append(dom_row);
			}

			if ("distribution" in row) {
				if (row["distribution"].length > 0) {
					$("#" + "distributionId_" + row.id).val(row["distribution"]);
					$("#" + "distributionId_" + row.id).prop("disabled", false);
					$("#" + "selectId_" + row.id).val("Distribution");
				}
			}

			treeData["isSaved"] = false;
		}

		function generateOptionString_cat(input) {
			var generatedRes = ""
			// for(var key in array){
			// 	generatedRes += "<option value='" + key + "'>" + key + "</option>";
			// }
			for (var x = 0; x < input.length; x++) {
				generatedRes += "<option value='" + input[x] + "'>" + input[x] + "</option>";
			}
			return generatedRes;
		}

		return treeData;
	}
})(jQuery)
