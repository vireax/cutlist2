function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function arraySum(arr, pad) {
	var sum = 0;
	for (var i = 0, len = arr.length; i < len; sum += arr[i++]);
	sum += (arr.length * pad);
	return sum;
}
function clearText() {
  // Select the element by ID and set its value to an empty string
  document.getElementById("import-data-in").value = "";
}



var CutList = (function() {
	function maxSize() {
		var arr = s.stock_array;
		var high = 0;
		for(var i = 0, len = arr.length; i < len; i++){
			high = (high < arr[i].size) ? arr[i].size : high;
		}
		return high;
	}
	var s, cl = {
		settings: {
			cut_array:      [],
			stock_array:    [],
			cut_list:       [],
			stock_list:     [],
			kerf:           4,
			stock:          6400,
			cut_ul:		$('#cut-list'),
			stock_ul:	$('#stock-list'),
			cut_length:	$('#cut-form input[name*="length"]'),
			cut_quantity:	$('#cut-form input[name*="quantity"]'),
			stock_length:	$('#stock-form input[name*="length"]'),
			stock_quantity:	$('#stock-form input[name*="quantity"]'),
			name_input:	$('#settings-form input[name*="cutlist-name"]'),
			stock_input:	$('#settings-form input[name*="stock-length"]'),
			kerf_input:	$('#settings-form input[name*="kerf"]'),
			cut_import:$('#import-form #import-data-in')
		},
		init: function() {
			s = this.settings;
			this.bindUI();
			this.renderUI();
		},

		/********** UI Functions **********/

		bindUI: function() {
			$('#import-form').submit(this.onCutImport);
			$('#cut-form').submit(this.onCutAdd);
			$('#stock-form').submit(this.onStockAdd);
			s.cut_ul.on('click', 'li a', this.onCutClick);
			s.stock_ul.on('click', 'li a', this.onStockClick);
			s.stock_input.change(this.onStockChange);
			s.kerf_input.change(this.onKerfChange);
		},
		renderUI: function() {
			this.optimize();
			$('#overflow-message').hide();
			s.cut_ul.empty();
			s.stock_ul.empty();
			for(var i = 0; i < s.cut_list.length; i++){
				//var el = $(sprintf("<li><a href='#'>%s&times;%s</a></li>", s.cut_list[i][0], s.cut_list[i][1]));
				var el = $(sprintf("<li><a href='#'>%s &times; %s</a></li>", s.cut_list[i][1], s.cut_list[i][0]));
				if(s.cut_list[i][1] > (maxSize() > s.stock ? maxSize() : s.stock)){
					el.addClass('overflow');
					$('#overflow-message').show();
				}
			// TO INSERT IMPORT CODE HERE
				s.cut_ul.append(el);

			}
			for(var i = 0; i < s.stock_list.length; i++){
				//var el = $(sprintf("<li><a href='#'>%s&times;%s</a></li>", s.stock_list[i][0], s.stock_list[i][1]));
				var el = $(sprintf("<li><a href='#'>%s &times; %s</a></li>", s.stock_list[i][1], s.stock_list[i][0]));
				s.stock_ul.append(el);
			}
			
			var max_stock_size = maxSize();
			$('#floor').empty();
			var el = $(sprintf("<h2>TOTAL = %s Bars</h2>", s.stock_array.length));
			$('#floor').append(el);
			
			for(var i = 0; i < s.stock_array.length; i++){
				var display_size = 85 * (s.stock_array[i].size/max_stock_size);
				//var el = $(sprintf("<div class='bin-outer'><div class='bin-label'>%s - (%s)</div><div class='bin-inner' style='height: %s%%'></div></div>", i+1, s.stock_array[i].size, Math.round(display_size)));
				//var el = $(sprintf("<div class='bin-outer'><div class='bin-label'>%s - (%s)</div><div class='bin-inner' style='width: %s%%'></div></div>", i+1, s.stock_array[i].size, display_size));
				var el = $(sprintf("<div class='bin-outer'><div class='bin-label'>%s - (%s)</div><div class='bin-inner' style='width: %s%%'></div></div>", i+1, s.stock_array[i].size, display_size-5));
				$('#floor').append(el);
				
				var inner_el = el.find(".bin-inner");
				if(!s.stock_array[i].custom && s.stock_list.length > 0) inner_el.addClass('over');
				var cuts = s.stock_array[i].cuts;
				var cuts_sum = 0;
				var cuts_count = 0;
				
				for(var j = 0; j < cuts.length; j++){
					
					var cut_size = Math.floor((inner_el.width()-1) * (cuts[j] / s.stock_array[i].size)) - 1;
					/*var cut_el = $(sprintf("<div class='parcel' style='height: %spx; line-height: %spx'>%s</div>", cut_size, cut_size, cuts[j]));*/
					
					//var cut_el = $(sprintf("<div class='parcel' style='width : %s%%;'>%s</div>", Math.floor(cuts[j]*100/s.stock_array[i].size),  cuts[j]));
					
					//var cut_el = $(sprintf("<div class='parcel' style='width: %spx;'>%s</div>", cut_size-15, cuts[j]));
					var cut_el = $(sprintf("<div class='parcel' style='width: %spx;'>%s</div>", cut_size-6, cuts[j]));
					inner_el.append(cut_el);
					cuts_sum+= cuts[j];
					cuts_count++;
				}
				// var remain_l = s.stock_array[i].size;
				// var remain_l = cuts_sum;
				// var remain_l = cuts_count;
				var remain_l = s.stock_array[i].size - cuts_sum - (cuts_count+1)*s.kerf_input.val();
				var remain_percent = remain_l*100/s.stock_array[i].size;
				// var remain_l = s.kerf_input.val();
				var remain_el = $(sprintf("<div class='remain_div'>%s (%s &#37;)</div>",remain_l, remain_percent.toFixed(2)));
				//$('#floor').append(remain_el);
				inner_el.append(remain_el);
			}
		},

		/********** Event Handlers **********/
		onKerfChange: function() {
			if(isNumber(s.kerf_input.val())){
				s.kerf = s.kerf_input.val() * 1;
			}else{
				s.kerf_input.val(s.kerf);
			}
			CutList.renderUI();
		},
		onStockChange: function() {
			if(isNumber(s.stock_input.val())){
				s.stock = s.stock_input.val() * 1;
			}else{
				s.stock_input.val(s.stock);
			}
			CutList.renderUI();
		},
		onCutAdd: function(e) {
			e.preventDefault();
			var len = s.cut_length.val();
			var qty = s.cut_quantity.val();
			if(isNumber(len) && isNumber(qty)){
				s.cut_list.push([qty*1,len*1]);
				CutList.renderUI();
			}
			s.cut_length.val('');
			s.cut_quantity.val(1);
			s.cut_length.focus();
			return false;
		},
		onCutImport: function(e) {
			e.preventDefault();
			const inputData = $('#import-data-in').val().trim();
			var new_sep = "_%$%$_";
			var list = [];
			var namesUsed = false;
			let import_strings = inputData.split("\n");
			console.log(import_strings);
			var nb_pcs=0;
			console.log(typeof nb_pcs);
			// var el = $(sprintf("<li><a href='#'>%s &times; %s</a></li>", s.stock_list[i][1], s.stock_list[i][0]));
			//var el = $(sprintf("<ul>"));
			//$('#demo').append(el);
			for (var i = 0; i < import_strings.length; i++) {
				const row = import_strings[i].trim();
				//el = $(sprintf("<li>%s</li>", row));
				//$('#demo').append(el);
				//const row2 = row.split(" "); // split single space
				// split by all white space 
				const row2 = row.split(/\s+/);
				//console.log(row2[0]);
				//console.log(row2[1]);
				var len = row2[0];
				var qty = row2[1];
				if(isNumber(len) && isNumber(qty)){
					s.cut_list.push([qty*1,len*1]);
					CutList.renderUI();
				}
				else{
					console.log("Invalid data");
				}
				nb_pcs+=Number(qty);
				console.log(nb_pcs);
				//$('#demo').append("<li>");
				//$('#demo').append(row);
				//$('#demo').append("</li>");
			}	
			//$('#demo').append("</ul>");
			//var el = $(sprintf("nb = %s",i));
			document.getElementById("demo").innerHTML = "nb. pcs = "+ nb_pcs;
			console.log(i);
			console.log(nb_pcs);
			var el = $(sprintf("<h2>TOTAL = %s Bars</h2>", s.stock_array.length));
			$('#demo').append(el);
			//$('#demo').append(el);
			/* 
			var len = s.cut_length.val();
			var qty = s.cut_quantity.val();
			if(isNumber(len) && isNumber(qty)){
				s.cut_list.push([qty*1,len*1]);
				CutList.renderUI();
			}
			*/
			//s.cut_length.val('');
			//s.cut_quantity.val(1);
			//s.cut_length.focus();
			return false;
		},
		onStockAdd: function(e) {
			e.preventDefault();
			var len = s.stock_length.val();
			var qty = s.stock_quantity.val();
			if(isNumber(len) && isNumber(qty)){
				s.stock_list.push([qty*1,len*1]);
				CutList.renderUI();
			}
			s.stock_length.val('');
			s.stock_quantity.val(1);
			s.stock_length.focus();
			return false;
		},
		onCutClick: function() {
			var index = $(this).parent().index();
			s.cut_list.splice(index,1);
			CutList.renderUI();
			return false;
		},
		onStockClick: function() {
			var index = $(this).parent().index();
			s.stock_list.splice(index,1);
			CutList.renderUI();
			return false;
		},

		/********** Logic **********/

		parseData: function() {
			s.cut_array = [];
			s.stock_array = [];

			for(var i = 0; i < s.stock_list.length; i++){
				for(var j = 0; j < s.stock_list[i][0]; j++){
					s.stock_array.push({
						size: s.stock_list[i][1],
						custom: true,
						cuts: []
					});
				}
			}
			for(var i = 0; i < s.cut_list.length; i++){
				if(s.cut_list[i][1] <= (maxSize() > s.stock ? maxSize() : s.stock)){
					for(var j = 0; j < s.cut_list[i][0]; j++){
						s.cut_array.push(s.cut_list[i][1]);
					}
				}
			}

		},
		sortStock: function() {
			s.stock_array.sort(function(a,b){
				var a_remaining = a.size - arraySum(a.cuts, s.kerf);
				var b_remaining = b.size - arraySum(b.cuts, s.kerf);
				if(a.custom == b.custom){
					return a_remaining - b_remaining;
				}else{
					return a.custom ? -1 : 1;
				}
			});
		},
		sortStockDisplay: function() {
			s.stock_array.sort(function(a,b){
				var a_remaining = a.size - arraySum(a.cuts, s.kerf);
				var b_remaining = b.size - arraySum(b.cuts, s.kerf);
				if(a.size == b.size)
					return a_remaining - b_remaining;
				return b.size - a.size;
			});	
		},
		sortCuts: function() {
			s.cut_array.sort(function(a,b){
				return b-a;
			});
		},
		addOverflow: function() {
			s.stock_array.push({
				size: s.stock,
				custom: false,
				cuts: []
			});
		},
		optimize: function() {
			this.parseData();
			this.sortCuts();
			this.sortStock();
			if(s.cut_array.length == 0) return;
			for(var i = 0; i < s.cut_array.length; i++){
				var index = 0;
				if(s.stock_array.length == 0)
					this.addOverflow();
				if(s.cut_array[i] > s.stock && s.cut_array[i] > maxSize()){
					alert('Fatal Error: optimize()');
					return;
				}
				while( (s.stock_array[index].size - arraySum(s.stock_array[index].cuts, s.kerf)) < s.cut_array[i]){
					index++;
					if(index >= s.stock_array.length) 
						this.addOverflow();
				}
				s.stock_array[index].cuts.push(s.cut_array[i]);
				this.sortStock();
			}
			this.sortStockDisplay();
		},
	};
	return cl;
}());

$(function(){
	CutList.init();
});
