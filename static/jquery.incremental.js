(function($){
	$.fn.bstreetable = function(options){
		$window = window;
		
		var element = this;
		var $container;
		var idCounterVraj = 0;
		
		var settings = {
			container:window,
			data:[],
			extfield:[],
			nodeaddEnable:true,
			maxlevel:9,
			nodeaddCallback:function(data,callback){},
			noderemoveCallback:function(data,callback){},
			nodeupdateCallback:function(data,callback){},
			targetupdateCallback:function(data,callback){},
            customalert:function(msg){
                alert(msg);
            },
            customconfirm:function(msg){
                return confirm(msg);
            },
			customSplitIdPrompt:function(msg){
				return prompt(msg);
			},
            text:{
                NodeDeleteText:"Are You Sure To Delete This Node?"
            }
		};
		
		var TREENODECACHE = "treenode";
		
		var language ={};
		language.addchild = "Add A Child Node";
		
		//Merging the data to the setting['data'] :- Merging of two objects in jQuery:
		if(options) {           
            $.extend(settings, options);
        }
		
		function generateOptionString(attr){
			var generatedRes  = ""
			for(var key in attr){
				generatedRes += "<option value='" + key + "'>" + key + "</option>";
			}
			return generatedRes;
		}
		
		function capitalizeEachWord(inp){
			var temp = inp.split(" ");
			values = [];
			for(var i=0; i < temp.length ; i++){
				var s = temp[i].trim();
				s = s.charAt(0).toUpperCase() + s.slice(1);
				values.push(s);
			}
			return values.join(" ");
		}
		
		$container = (settings.container === undefined ||
                      settings.container === window) ? $window : $(settings.container);
		
        var dom_addFirstLevel = $("<div class='tt-operation m-b-sm'></div>").append($("<button class='btn btn-primary btn-sm' id='clear_generated_tree'><i class='fa fa-remove'></i>&nbsp;Clear Tree</button>"), $("<input type='text' id='attr_hidden_info' style='display:none' name='attr_hidden_info' />"), $("<input type='text' id='target_hidden_info' style='display:none' name='target_hidden_info' />"));
		
		var dom_table = $("<div class='tt-body'></div>");
        var dom_header = $("<div class='tt-header'></div>");
        
        renderHeader(dom_header); 
        element.html('').append(dom_addFirstLevel).append(dom_header);
        
		var treeData = {};
		var _targetObjDetail = {};
		var _targetVar = "";
		var _targetValues = [];
		var _otherAttrDetail = {};
		var _newTargetVarName = "";
		
		function loadBasicData(){
			for(var i=0; i < settings.data.length;i++){
				var row = settings.data[i];
				if(!row.pid){
					idCounterVraj += 1;
					generateTreeNode(dom_table, row, 1);
					treeData[row.id] = row;
				}
			}
		}
		
		function clear_previous_entries(){
			dom_table.empty();
			idCounterVraj = 0;
			for(var entry in treeData){
				delete treeData[entry];
			}
			loadBasicData();
		}
		
		loadBasicData();
		element.append(dom_table);
		
		$('#attr_hidden_info').on('change', function() {
			clear_previous_entries();
			
			_targetObjDetail = JSON.parse($("#target_hidden_info").val());
			_targetVar = Object.keys(_targetObjDetail)[0];
			_targetValues = _targetObjDetail[_targetVar]["values"];
			_otherAttrDetail = JSON.parse($("#attr_hidden_info").val());
			_newTargetVarName = $("#newVarName").val();
			
			for(var p = 0; p < _targetValues.length; p++){
				idCounterVraj += 1;
				var row = {id: idCounterVraj, name: _targetVar + " = " + _targetValues[p], pid: 0};
				generateTreeNode(dom_table, row, 1);
				treeData[row.id] = row;
			}
		});
		
		$('#clear_generated_tree').click(function(){
			if(settings.customconfirm("Do you want to reset the tree?")){
				clear_previous_entries();
			}
		});
		
        element.delegate(".j-expend","click",function(event){
        	if(event.target.classList[0]=="fa"){
        		var treenode = treeData[$(this).attr('data-id')];
	        	toggleicon($(this));
	        	if($(this).parent().attr('data-loaded')){
	        		toggleExpendStatus($(this),treenode);        		
	        	}
	        	else{	        	
		        	loadNode($(this),treenode);
	        	}
        	}        	        
        });
		
        element.delegate(".j-addClass","click",function(){
			idCounterVraj += 1;
            var curElement = $(".tt-body");
            var row = {id: "", name: "", pid: 0};
            var curLevel = 1;
			generateTreeNode(curElement, row, curLevel, true);
        });
		
        element.delegate(".j-remove","click",function(event){
            var parentDom = $(this).parents(".class-level-ul");		
			var that = $(this);
			console.log("BEFORE DELETION: ", treeData);
			
			if(settings.customconfirm(settings.text.NodeDeleteText)){
				settings.noderemoveCallback(that.parents(".class-level-ul").attr("data-id"),function(){
					var ulLevelInfo = that.parents(".class-level-ul");
					var ownId = parseInt(ulLevelInfo.attr("data-id"));
					
					var entireBranch = [ownId];
					
					while(entireBranch.length > 0){
						var currId = entireBranch.pop();
						
						for(var key in treeData) {
							if (treeData[key]["pid"]==currId) {
								entireBranch.push(treeData[key]["id"]);
								delete treeData[key];
							}
						}					
						delete treeData[currId];
					}
					
					that.parents(".class-level-ul").parent().remove();
				});
			}
			console.log("AFTER DELETION: ", treeData);
            
        });
		
		element.delegate(".j-addChild","click",function(){
			idCounterVraj += 1;
			
			var curElement = $(this).closest(".class-level");
            var requiredInput = curElement.find(".form-control*[required]");
            var hasError = false;
            requiredInput.each(function(){
                if($(this).val()==""){
                    $(this).parent().addClass("has-error");
                    hasError = true;                    
                }
            });
            if(!hasError){
                var pid = curElement.find(".j-expend").attr("data-id");
                var curLevel = $(this).parents(".class-level-ul").attr("data-level") - 0 + 1; 
				
				var row = {id:"", name:"", pid:pid};
                generateTreeNode(curElement, row, curLevel);   
            }
        	     	
        });
		
        element.delegate(".form-control","focus",function(){
            $(this).parent().removeClass("has-error");
        });
        
		element.delegate(".form-control","blur",function(){
			var curElement = $(this);
            var data = {};
			
			//data.id = curElement.parent().parent().attr("data-id");
            
			var parentUl = curElement.closest(".class-level-ul");
            
			data.id = idCounterVraj;
			data.pid = parentUl.attr("data-pid");
            
			//data.pinnercode = curElement.parents(".class-level-"+(parentUl.attr("data-level")-1)).children("ul").attr("data-innercode");
			//Flow: Adding Node -> Will call callback function -> Will again call callback function (I guess with updated ID)
			
			parentUl.find(".form-control").each(function(){
                data[$(this).attr("name")]=$(this).val();                
            });
			
			var isSelect = false;
			var isNewTarget = false;
			
			//to check whether curElement is select or not:
			if(curElement.attr("id")){
				isSelect = curElement.attr("id").includes('selectId');
				isNewTarget = curElement.attr("id").includes('newTargetId');
			}
			
			if(isSelect){
				if(data.attribute == "newTargetSelect"){
					if(parentUl.parent().find(".class-level").length>0){
						settings.customalert(data.name + " cannot be leaf node as it has child(ren).");
					}else{						
						var distributionInputElement = $($($(parentUl.get(0)["children"]).get(2)).get(0)["children"]);
						distributionInputElement.prop('disabled', false);
						
						//Following snippet is added to get the id while updating the data. Otherwise it will take the latest idCounterVraj.
						data.id = parseInt(curElement.parent().parent().attr("data-id"));
						
						treeData[data.id]["new_val"] = "";
					}
				}else{
					if(_newTargetVarName.length == 0){
						settings.customalert("First name the New Target Variable!");
						return;
					}else{
						$("#newVarName").prop('disabled', true);
					}
					
					totalSubCat = [];
					var currentAttr = settings.availableAttributes[data.attribute];
					
					if(currentAttr['type']=="categorical"){
						for(var x=0; x < currentAttr["values"].length; x++){
							totalSubCat.push(data.attribute + " = " + currentAttr["values"][x]);
						}							
						//LOGIC FOR REMOVING THE CATEGORICAL VARIABLE ONCE ADDED!
						//delete settings.availableAttributes[data.attribute];
					}else{
						var userInpSplit = settings.customSplitIdPrompt("Enter Split for "+data.attribute);
						if(!userInpSplit){
							return;
						}
						totalSubCat = [data.attribute + " >= " + userInpSplit, data.attribute + " < " + userInpSplit];
					}
					
					for(var eachcat=0; eachcat < totalSubCat.length; eachcat++){
						idCounterVraj += 1;
						
						var curElement = $(this).closest(".class-level");
						
						var requiredInput = curElement.find(".form-control*[required]");
						var pid = curElement.find(".j-expend").attr("data-id");
						var curLevel = $(this).parents(".class-level-ul").attr("data-level") - 0 + 1; 
						
						var row = {id:idCounterVraj, name:totalSubCat[eachcat], pid:pid};
						
						generateTreeNode(curElement, row, curLevel);
						treeData[idCounterVraj] = {"id":idCounterVraj, "name":totalSubCat[eachcat] , "pid":parseInt(pid)}
					}
				}
				/*
					var parentDom = $(this).parents(".class-level-ul");
					var isRemoveAble = false;
					if(parentDom.attr("data-loaded")=="true"){
					if(parentDom.parent().find(".class-level").length>0){
				*/
			}
			else if(!isSelect && !isNewTarget && !curElement.attr("data-oldval")){
				console.log("Adding Node");
				console.log("jQuery: ", data);
				
                settings.nodeaddCallback(data,function(_data){
                    if(_data){
						console.log("NOT SURE ABOUT THE ORDER: ",_data);
						
						//To populate data-id to li and ul (which are parent and parent's parent of textbox.)
						curElement.parent().attr("data-id",_data.id);
                        curElement.parent().parent().attr("data-id",_data.id);
                        curElement.attr("data-oldval",curElement.val());
						treeData[_data.id] = {"id":_data.id, "name": _data.name, "pid":parseInt(_data.pid)}
					}
                });                            
            }
            else if(!isSelect && !isNewTarget && curElement.attr("data-oldval")!=curElement.val()){
				console.log("Updating Node");
				console.log("ATTRIBUTES RECEIVED: ", settings.availableAttributes);
				
				//Following snippet is added to get the id while updating the data. Otherwise it will take the latest idCounterVraj.
				
				console.log("BEFORE: ",data);
				data.id = parseInt(curElement.parent().parent().attr("data-id"));
				console.log("AFTER: ",data);
				
				//var tempArr = curElement.parent().parent().children().get(1)['firstChild'];
				//console.log($(tempArr).val());
				
				settings.nodeupdateCallback(data,function(){
					treeData[data.id] = {"id":data.id, "name": data.name, "pid":parseInt(data.pid)}
                    curElement.attr("data-oldval",curElement.val());
                });
            }else if(isNewTarget){
				
				//Logic for distribution data handling.
				//Following snippet is added to get the id while updating the data. Otherwise it will take the latest idCounterVraj.
				
				console.log("NEW TARGET BEFORE: ",data);
				data.id = parseInt(curElement.parent().parent().attr("data-id"));
				console.log("NEW TARGET AFTER: ",data);
				
				treeData[data.id]["new_val"] = capitalizeEachWord(data.newTargetValue);
			}
			
			console.log("ENTIRE TREE: ", treeData);
        });
		
		function renderHeader(_dom_header){
        	var dom_row = $('<div></div>');
        	dom_row.append($("<span class='maintitle'></span>").text(settings.maintitle));
        	dom_row.append($("<span></span>"));
			
			//Mostly will get ignored just because no extra fields. EXTFIELDS: Extra fields. Between Attribute and Operation
    		
			for(var j=0;j<settings.extfield.length;j++){
    			var column = settings.extfield[j];    			
    			$("<span></span>").css("min-width","166px").text(column.title).appendTo(dom_row);
    		}
			
    		dom_row.append($("<span style='margin-left: 100px' class='textalign-center'>New Target Value OR Operation</span>")); 
    		_dom_header.append(dom_row);
        }
		
        function generateColumn(row,extfield){
        	var generatedCol;
        	switch(extfield.type){
        		case "input":generatedCol=$("<input type='text' class='form-control input-sm'/>").val(row[extfield.key]).attr("data-oldval",row[extfield.key]).attr("name",extfield.key);break;
				case "select":generatedCol=$("<select id='selectId_"+ row.id +"' style='margin-left:215px' class='form-control' name='attribute'>" + 
				generateOptionString(_otherAttrDetail) + "<option value=newTargetSelect> " + capitalizeEachWord(_newTargetVarName) + " </option>" + "</select>");
				break;
        		default:generatedCol=$("<span></span>").text(row[extfield.key]);break;
        	}
        	return generatedCol;
        }
		
        function toggleicon(toggleElement){
        	var _element = toggleElement.find(".fa");
        	if(_element.hasClass("fa-plus")){
        		_element.removeClass("fa-plus").addClass("fa-minus");
        		toggleElement.parent().addClass("selected");
        	}else{
        		_element.removeClass("fa-minus").addClass("fa-plus");
        		toggleElement.parent().removeClass("selected")
        	}
        }
		function toggleExpendStatus(curElement){
			if(curElement.find(".fa-minus").length>0){
                 curElement.parent().parent().find(".class-level").removeClass("rowhidden");
            }
            else{
                curElement.parent().parent().find(".class-level").addClass("rowhidden");
            }
           
		}
		function loadNode(loadElement,parentNode){
			var curElement = loadElement.parent().parent();
        	var curLevel = loadElement.parent().attr("data-level")-0+1; 
        	if(parentNode&&parentNode.id){
                for(var i=0;i<settings.data.length;i++){
    	        	var row = settings.data[i];
    	        	//render first level row while row.pid equals 0 or null or undefined
    	        	if(row.pid==parentNode.id){
    	        		generateTreeNode(curElement,row,curLevel);
                        treeData[row.id] = row;
    	        	}	        	
    	        }                
            }
            loadElement.parent().attr('data-loaded',true);
	    }
		
        function generateTreeNode(curElement, row, curLevel, isPrepend){
			var dom_row = $('<div class="class-level class-level-'+curLevel+'"></div>');
            var dom_ul =$('<ul class="class-level-ul"></ul>');
			
            dom_ul.attr("data-pid", row.pid).attr("data-level", curLevel).attr("data-id", row.id);
            
			if(curLevel-0>=settings.maxlevel){
                $('<li class="j-expend"></li>').append('<label class="fa p-xs"></label>').append($("<input type='text' class='form-control input-sm' required/>").attr("data-oldval",row['name']).val(row['name']).attr("name","name")).attr('data-id',row.id).appendTo(dom_ul);
                dom_ul.attr("data-loaded",true);
            }
            else{
                $('<li class="j-expend"></li>').append('<label class="fa fa-plus p-xs"></label>').append($("<input type='text' class='form-control input-sm' required/>").attr("data-oldval",row['name']).val(row['name']).attr("name","name")).attr('data-id',row.id).appendTo(dom_ul);
            }
			
			for(var j=0;j<settings.extfield.length;j++){
				var colrender = settings.extfield[j];
				var coltemplate = generateColumn(row,colrender);
				$('<li></li>').attr("data-id",row.id).html(coltemplate).appendTo(dom_ul);
			}
			
            if(settings.nodeaddEnable){
                if(curLevel-0>=settings.maxlevel){
                    $("<li></li>").attr("data-id",row.id).appendTo(dom_ul);
                }
                else{
                    //$("<li></li>").append($('<button class="btn btn-outline btn-sm j-addChild"><i class="fa fa-plus"></i>'+language.addchild +'</button>').attr("data-id",row.id)).appendTo(dom_ul);
					
					$("<li></li>").append($("<input id='newTargetId_"+ row.id +"'  name='newTargetValue' type='text' class='form-control input-sm form-distribution' style='text-transform: capitalize;' disabled/>").attr("data-id",row.id)).appendTo(dom_ul);
                }
            }
			
			dom_ul.append($("<li><i class='fa fa-remove j-remove'></i></li>"));
			dom_row.append(dom_ul);
			
            if(isPrepend){
                curElement.prepend(dom_row);
            }
            else{
                curElement.append(dom_row);
            }
		}
		
		return treeData;
	}
})(jQuery)