cb.isEqual=function(obj1,obj2){
		var isEqual=cb.isEqual;
		//相等直接返回
		if(obj1==obj2){return true;}
		//不等且有一个为普通类型时，返回
		if(typeof obj1!=='object'||typeof obj2!=='object'){
			return false;
		}
		
		//如果两个都是对象，分数组和普通对象分别处理
		var type1=Object.prototype.toString.apply(obj1),
			type2=Object.prototype.toString.apply(obj2);
		//有一个为数组时	
		if(type1==='[object Array]' || type2==='[object Array]'){
			if(type1===type2){//都为数组
				if(obj1.length!==obj2.length)return false;
				for(var i=obj1.length-1;i>=0;i--){
					if(!isEqual(obj1[i],obj2[i]))return false;
				}
				return true;
			}else{
				return false;
			}
		}else{//都为对象
			var equalProps={};
			for(var p in obj1){
				if(!isEqual(obj1[p],obj2[p])){
					return false;
				}else{
					//记录这个属性，避免重复比较
					equalProps[p]=true;
				}
			}
			for(var p in obj2){
				if(!equalProps[p] && !isEqual(obj1[p],obj2[p])){
					return false;
				}
			}
			return true;
		}
		
	};
cb.binding.DataGridBinding = function (mapping, parent) {
	
    cb.binding.BaseBinding.call(this, mapping, parent);
	//重写PropertyChangeEvent、get_method方法
	cb.binding.DataGridBinding.prototype.Model2UI = cb.binding.DataGridBinding.prototype.PropertyChangeEvent = function (evt) {
		cb.console.log("PropertyChangeEvent", evt);
		if (!evt) return;
		var control = this.getControl();
		if (!control) return;
		if (cb.isEqual(this.getProperty(control, evt.PropertyName) ,evt.PropertyValue))//如果属性值相等，则不触发刷新
			return;
		this.setProperty(control, evt.PropertyName, evt.PropertyValue);

		cb.console.log("PropertyChangeEvent", evt);
	}
	cb.binding.DataGridBinding.prototype.get_method = function (prefix, control, propertyName) {
		if (!control || !propertyName || !prefix) return;
		var propertyNameLower = String.toLowerCase(propertyName);
		if (!propertyNameLower) return;
		if (propertyNameLower.indexOf(prefix) == 0)
			propertyNameLower = propertyNameLower.substring(3);
		propertyName=propertyName.substring(0, 1).toLowerCase() + propertyName.substring(1, propertyName.length);
		var method = this["_" + prefix + "_" + propertyName];
		if (method) return method;

		var controlMethodName = prefix + propertyName.substring(0, 1).toUpperCase() + propertyName.substring(1, propertyName.length);
		if (!control[controlMethodName]) return;

		//动态创建方法
		method = this["_" + prefix + "_" + propertyNameLower] = function (ctrl, propertyValue) {
			if (ctrl[controlMethodName])
				ctrl[controlMethodName].call(ctrl, propertyValue);
		};
		return method;
	};
    this._onSortFieldsChange = function (args) {
        var model = this.getModel();
        if (!model) return;
		model.setSortFields(args.sortFields,args.noReflesh);
    };
	this._onMergeStateChange=function(merge){
		var model = this.getModel();
		model.setMergeState(merge);
	};
	
	this._set_displayRows=function(control,rows){
		control.loadData(rows);
		//每次重新加载数据后要重新同步选中状态，及焦点状态
		var model=this.getModel();
		control.select(model.getPageSelectedIndexs());
		control.setFocusedRow(model.getFocusedIndex());
	};
	//合并状态修改后，处理显示
	this._set_mergeInfo=function(control,args){
		if(args.mergeCells){
			control.mergeCells(args.mergeCells);
		}else{
			control.loadData(args.rows);
			var model=this.getModel();
			control.select(model.getPageSelectedIndexs());
			control.setFocusedRow(model.getFocusedIndex());
		}
	};
	//处理model的行选择事件,焦点管理
	this._set_select=function(control,rowIndexs){
		if(this._isSelectedSyc())return;
		
		control.select(rowIndexs);
	};
	this._set_unselect=function(control,rowIndexs){
		if(this._isSelectedSyc())return;
		
		control.unselect(rowIndexs);
	};
	this._set_selectAll=function(control){
		if(this._isSelectedSyc())return;
		
		control.selectAll();
	};
	this._set_unselectAll=function(control){
		if(this._isSelectedSyc())return;
		
		control.unselectAll();
	};
	
	this._set_focusedIndex=function(control,rowIndex){
		control.setFocusedRow(rowIndex);
	};
	//选中状态是否已经同步（内部辅组方法）
	this._isSelectedSyc=function(){
		return cb.isEqual(this.getControl().getSelectedRows(),this.getModel().getPageSelectedIndexs());
	};
	//处理控件触发的行选择和焦点改变事件
	this._onSelect=function(rowIndexs){
		if(this._isSelectedSyc())return;
		
		var model = this.getModel();
		model.select(rowIndexs);
	};
	this._onUnselect=function(rowIndexs){
		if(this._isSelectedSyc())return;
		
		var model = this.getModel();
		model.unselect(rowIndexs);
	};
	this._onSelectAll=function(){
		if(this._isSelectedSyc())return;
		
		var model = this.getModel();
		model.selectAll();
	};
	this._onUnselectAll=function(){
		if(this._isSelectedSyc())return;
		
		var model = this.getModel();
		model.unselectAll();
	};
	this._onFocusChange=function(index){
		var model = this.getModel();
		model.setFocusedIndex(index);
	};
	//
	this._set_pageInfo=function(control,pageInfo){
		//更新视图
		//var model = this.getModel();
		//model._pager
		if(this._pager){
			this._pager.update(pageInfo);
		}
	},
	this._set_columns=function(control,data){
		control.setData(data);
	};
    //监听状态改变
	this._set_stateChange = function (control, data) {
	    var property = data.propertyName;
	    switch (property) {
	        case 'readOnly': control.setEditable(!data.value); break;
            
	        default: break;
	    }
	};
	this._set_fieldStateChange = function () { };
	this._set_rowStateChange = function () { };
	///////////编辑功能相关
	
	this._onBeforeCellEditing=function(data){
		this.getModel()._onBeforeCellEditing(data);
	};
	this._set_cellEditing=function(control,data){
		control._setCellEditing(data.field,data.index,data.row);
	};

	this._set_registerFieldEditor=function(control,data){
		control.registerFieldEditor(data.name,data.def);
	};
	this._onCellChange=function(data){
		var model = this.getModel();
		model.setCellValue(data.rowIndex, data.field,data.value);
	};
	this._set_cellValue=function(control,data){
		var rowData=this.getModel().getRow(data.index);
		control.updateCell(data.index,data.field,data.value,rowData);
	};
	//支持监听clickRow dblClickRow事件
	this._onClickRow=function(index){
		var model=this.getModel();
		var rowData=model.getRow(index);
		model.execute('clickRow',{row:rowData,index:index});
	};
	this._onDblClickRow=function(index){
		var model=this.getModel();
		var rowData=model.getRow(index);
		model.execute('dblClickRow',{row:rowData,index:index});
	};


    this.applyBindings = function () {
        var model = this.getModel();
        var control = this.getControl();
        if (!model || !control) return;
        if (this._mapping.bindingMode == cb.binding.BindingMode.TwoWay) {

			control.un("mergeStateChange", this._onMergeStateChange);
            control.on("mergeStateChange", this._onMergeStateChange, this);
            control.un("sortFieldsChange", this._onSortFieldsChange);
            control.on("sortFieldsChange", this._onSortFieldsChange, this);
			
            control.un("select", this._onSelect);
            control.on("select", this._onSelect, this);
			control.un("unselect", this._onUnselect);
            control.on("unselect", this._onUnselect, this);
			control.un("selectAll", this._onSelectAll);
            control.on("selectAll", this._onSelectAll, this);
			control.un("unselectAll", this._onUnselectAll);
            control.on("unselectAll", this._onUnselectAll, this);
			control.un("focusChange", this._onFocusChange);
            control.on("focusChange", this._onFocusChange, this);
			
			control.un("beforeCellEditing", this._onBeforeCellEditing);
			control.on("beforeCellEditing", this._onBeforeCellEditing, this);
			control.un("cellChange", this._onCellChange);
            control.on("cellChange", this._onCellChange, this);
			control.un("clickRow", this._onClickRow);
            control.on("clickRow", this._onClickRow, this);
			control.un("dblClickRow", this._onDblClickRow);
            control.on("dblClickRow", this._onDblClickRow, this);
			//

        }
        model.addListener(this);
		//
		if(model._data.pager&&model.getPageSize()>0){
			var viewModelEl=this.getControl().$el.closest('[data-viewmodel='+model._parent.getModelName()+']');
			var pager=new cb.controls['Pager']($('.'+model._data.pager,viewModelEl),model);

			pager.update(model.getPageInfo());
			this._pager=pager;
		}
    };
};
cb.binding.DataGridBinding.prototype = new cb.binding.BaseBinding();
