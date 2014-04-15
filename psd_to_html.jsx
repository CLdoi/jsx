main();

 //���C������
function main(){
    var document = activeDocument;
    var layers = document.layers;
    var n = layers.length;
    var folderObj = Folder.selectDialog("�摜�̕ۑ�����w�肵�ĂˁI")
    
    for (var i=0; i<n; i++){
        layers[i].visible = false;
    }

    for (var i=0; i<n; i++){
        layers[i].visible = true;
        var filename = layers[i].name;
        var pngOptions = new PNGSaveOptions();
        var filepath = folderObj + "/" + filename + ".png";
        $.writeln ( "resizePNGSave [" + i + "] > file : " + filepath );
        activeDocument.saveAs( File( filepath ), pngOptions, true, Extension.LOWERCASE );
        layers[i].visible = false;
    }
    
    var CR = String.fromCharCode(13);
    var TAB = String.fromCharCode(9);
    savename = File.saveDialog("�ۑ�����t�@�C���������Ă�������");
    if (savename){
        fileObj = new File(savename);
        flag = fileObj.open("w");
        if (flag == true){
            
            fileObj.write("<html>"+ CR);
            fileObj.write("<head>"+ CR);
            fileObj.write("<title>�e�X�g</title>"+ CR);
            fileObj.write("</head>"+ CR);
            fileObj.write("<body>"+ CR);
            
            for (i=0; i <n;i++){
                layName = activeDocument.artLayers[i].name;
                var x1 = parseInt(activeDocument.artLayers[i].bounds[0]);
                var y1 = parseInt(activeDocument.artLayers[i].bounds[1]);
                //str = "<IMG style=' position:absolute; z-index:" + (n - i) + ";top:" + x1 + "; left:" + y1 + ";' src= '"+layName + ".png'>" + CR ;
                str = "<img style=' position:absolute; z-index:" + (n - i) + ";' src= '"+layName + ".png'>" + CR ;
                fileObj.write( str );
            }
        
            fileObj.write("</body>"+ CR);
            fileObj.write("</html>"+ CR);
        
            fileObj.close();
        }else{
            alert("�t�@�C�����J���܂���ł���");
        }
    }
    alert("�������������܂����B�X�N���v�g���I�����܂��B");
}