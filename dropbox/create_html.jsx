///// GLOBAL SETTINGS /////
preferences.rulerUnits = Units.PIXELS;	// 単位をピクセルに
var document = activeDocument;
var result = [];

var folderObj = Folder.selectDialog("画像の保存先を指定してね！")
var baseURL = folderObj +"/";
var currentFolder = "";
var imgDir = "img";

var LIMIT = 200;
var count = 0;


///// USER SETTINGS /////
var useFolder = false;
var TYPE_JPEG = "JPEG";
var TYPE_PNG = "PNG";
var saveFileFlag = true;
var saveFileType = TYPE_PNG;
var pngBit = 24;
var jpegQuality = 100;

var saveAsPSD = false;


///// RUN /////
main();


///// MAIN METHODS /////
function main(){
	setVisible(document.layers, false);

	if( !useFolder ) {
		baseURL += getNameRemovedExtendType(document);
		_createFolder(baseURL);
        _createFolder(baseURL + "/" + imgDir + "/");
        baseURL += "/" + imgDir + "/";
	}

	outputLayers(document.layers, null );
	setVisible(document.layers, true);
    createHtml(document.layers);
	result.push("complete!");

	report();
}

///// UTILITY METHODS /////
// 拡張子を除去
function getNameRemovedExtendType(doc) {
	var nameParts = String(doc.name).split(".");
	var name = nameParts.splice(0, nameParts.length-1).join(".");
	return name;
}
function getValidName(name){
	name = name.replace(/\/$/,"");
	return name.replace(/[\/\:\;\.\,\@\"\'\\]/g,"_");
}

// ログ出力
function report(){
	alert( result.join("\n") );
}



///// OUTPUT LAYER METHODS /////
// メイン処理レイヤーリスト
function outputLayers(layers, folder){
	if( !!folder ) createFolder( folder );
	for( var i=0, l=layers.length; i<l; ++i ) {
		var layer = layers[i];
		if( layer.typename == "LayerSet" ){
			var tmp = currentFolder;
			outputLayers(layer.layers, layer.name );
			currentFolder = tmp;
		}
		else {
            if( count++>LIMIT ) return;
            if(layer.kind !== LayerKind.TEXT){
                clippingLayer(layer);
            }
		}
	}
}


// メイン処理レイヤー
function clippingLayer(obj){
	//書き出し準備
	//setVisible(document.layers, false);
	setVisible(obj, true);

	//レイヤーの画像範囲を取得
	var boundsObj = obj.bounds;
	x1 = parseInt(boundsObj[0]);
	y1 = parseInt(boundsObj[1]);
	x2 = parseInt(boundsObj[2]);
	y2 = parseInt(boundsObj[3]);

　//指定範囲を選択
	selectReg = [[x1,y1],[x2,y1],[x2,y2],[x1,y2]];
	activeDocument.selection.select(selectReg);

	try {
		//選択範囲を結合してコピー
		activeDocument.selection.copy(true);
		
		//選択を解除
		activeDocument.selection.deselect();

		//新規ドキュメントを作成
		var width = x2 - x1;
		var height = y2 - y1;
		var resolution = 72;
		var name = getValidName(obj.name);
		var mode = NewDocumentMode.RGB;
		var initialFill = DocumentFill.TRANSPARENT;

		preferences.rulerUnits = Units.PIXELS;
		newDocument = documents.add(width, height, resolution, name, mode, initialFill);

		//画像をペースト
		newDocument.paste();
		
		//新規レイヤーの画像範囲を取得
		var newBoundsObj = newDocument.activeLayer.bounds;
		nx1 = parseInt(newBoundsObj[0]);
		ny1 = parseInt(newBoundsObj[1]);
		nx2 = parseInt(newBoundsObj[2]);
		ny2 = parseInt(newBoundsObj[3]);
		
		//空白がある場合は切り抜き
		if((nx2 - nx1) != (x2 - x1) || (ny2 - ny1) != (y2 - y1)){
			newDocument.crop(newBoundsObj);
		}
		
		//ファイルに書き出し
	  //*
		if(saveFileFlag == true){
			switch(saveFileType){
				case TYPE_PNG:
					savePNG( currentFolder, name, pngBit );
					break;
				case TYPE_JPEG:
					saveJPEG( currentFolder, name, jpegQuality );
					break;
			}
		}
		//*/
		if( saveAsPSD ) {
			newDocument.close( SaveOptions.SAVECHANGES );
		}
		else {
			newDocument.close( SaveOptions.DONOTSAVECHANGES );
		}
		//successList.push(obj);
	}
	catch(e){
		//選択範囲に何も含まれていない場合
		//errorList.push(obj);
		result.push( obj.name+": "+e.message);
	}
	finally{
		//元のドキュメントをアクティブに設定
		activeDocument = document;
		setVisible(obj, false);
	}
}




//フォルダ作成処理
function createFolder( folderName ) {
	currentFolder += getValidName(folderName)+"/";

	if( !useFolder ) return true;
	_createFolder(baseURL+currentFolder);
}
function _createFolder(url) {
	var folder = new Folder(url);
	
	if( folder.exists ) {
		return false;
	}
	else {
		folder.create();
		return true;
	}
}

///// VISIBILITY LAYER METHODS /////
// レイヤー表示処理
function setVisible(obj, bool){
	var i=0, l;
	switch( obj.typename ) {
		//case "LayerSets":
		case "Layers":
			for( l=obj.length; i<l; ++i ) {
				setVisible(obj[i],bool);
			}
		break;
		case "LayerSet":
			obj.visible = bool;
			for( l=obj.layers.length; i<l; ++i ) {
				setVisible(obj.layers[i], bool);
			}
		break;
		default:
			obj.visible = bool;
			if( bool ) displayParent( obj );
		break;
	}
}
function displayParent(obj){
		if(obj.parent){
			obj.parent.visible = true;
			displayParent( obj.parent );
		}

}
function isLayerSet(obj){
	return Boolean(obj.typename == "LayerSet");
}





///// SAVE FILE METHODS /////
// 保存処理
function savePNG(path, name, bit){
	var exp = new ExportOptionsSaveForWeb();
	exp.format = SaveDocumentType.PNG;
	exp.interlaced　= false;

	if(bit == 8){
		exp.PNG8 = true;
	}else{
		exp.PNG8 = false;
	}

	fileObj = new File( getFileName( path, name, "png") );
	
	activeDocument.exportDocument(fileObj, ExportType.SAVEFORWEB, exp);
}

function saveJPEG(path, name, quality){
	var exp = new ExportOptionsSaveForWeb();
	exp.format = SaveDocumentType.JPEG;
	exp.interlaced　= false;
	exp.optimized= false;
	exp.quality = quality;

	fileObj = new File(getFileName(path, name, "jpg"));
	
	activeDocument.exportDocument(fileObj, ExportType.SAVEFORWEB, exp);
}

// ファイル名の重複回避処理
function getFileName( path, name, ext ){

	if( useFolder ) {
		path = baseURL + path;
	}
	else {
		name = getValidName(path+name);
		path = baseURL;
	}

	var filename = [ path, name ].join("/");
	var count = 0;
	var newFileName = "";

	newFileName = filename + "." + ext
	var file = new File(newFileName);
	
	while(file.exists != false){
		count +=1;
		newFileName = filename + count + "." + ext
		file = new File(newFileName);
	}
	return newFileName;
}

function createHtml(layers){
    var CR = String.fromCharCode(13);
    var TAB = String.fromCharCode(9);
    //savename = File.saveDialog("保存するファイル名を入れてください");
    baseURL = folderObj +"/" + getNameRemovedExtendType(document);
    savename = baseURL + "/" + getNameRemovedExtendType(document) + ".html";
    if (savename){
        fileObj = new File(savename);
        flag = fileObj.open("w");
        if (flag == true){
            
            fileObj.write("<html>"+ CR);
            fileObj.write("<head>"+ CR);
            fileObj.write("<title>" + getNameRemovedExtendType(document) + "</title>"+ CR);
            fileObj.write("</head>"+ CR);
            fileObj.write("<body>"+ CR);
            
            var n = layers.length;
            for (i=0; i <n;i++){
                layName = "./img/" + layers[i].name;
                var x1 = parseInt(layers[i].bounds[0]);
                var y1 = parseInt(layers[i].bounds[1]);
                
                if(layers[i].kind === LayerKind.TEXT){
                    fontsize = parseInt(layers[i].textItem.size);
                    fontcolor = layers[i].textItem.color;
                    fontred = parseInt(fontcolor.rgb.red);
                    fontgreen = parseInt(fontcolor.rgb.green);
                    fontblue = parseInt(fontcolor.rgb.blue);
                    
                    
                    str = "<p style=' position:absolute; z-index:" + (n - i) + "; top:" + y1 + "px; left:" + x1 + "px; font-size:" + fontsize + "; color:rgb(" + fontred + ", " + fontgreen + ", " + fontblue + "); '>" + layers[i].textItem.contents + "</p>" + CR ;
                }else{
                    //str = "<img style=' position:absolute; z-index:" + (n - i) + ";' src= '"+layName + ".png'>" + CR ;
                    str = "<img style=' position:absolute; z-index:" + (n - i) + "; top:" + y1 + "px; left:" + x1 + "px;' src= '"+layName + ".png'>" + CR ;
                }
                fileObj.write( str );
            }
        
            fileObj.write("</body>"+ CR);
            fileObj.write("</html>"+ CR);
        
            fileObj.close();
        }else{
            alert("ファイルが開けませんでした");
        }
    }   
 }
