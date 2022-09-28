//QRコード読み取り処理
window.SQR = window.SQR || {};

SQR.reader = (() => {
    if (!navigator.mediaDevices) {
        document.write('Sorry,your browser is unsupported...');
        return;
    }

    const video = document.querySelector('#js-video');

    /**
    * videoの出力をCanvasに描画して画像化 jsQRを使用してQR解析
    */
    const checkQRUseLibrary = () => {
        //console.log('checkQRuseLibrary');
        const canvas = document.querySelector('#js-canvas');
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
            const id = code.data;
            if(id==99999){
		        logout();
	            return;
	        }
            showinfo(id);
        } else {
            setTimeout(checkQRUseLibrary, 10);
        }
    };

    /**
    * videoの出力をBarcodeDetectorを使用してQR解析
    */
    const checkQRUseBarcodeDetector = () => {
        const barcodeDetector = new BarcodeDetector();
        barcodeDetector
        .detect(video)
        .then((barcodes) => {
            if (barcodes.length > 0) {
                for (let barcode of barcodes) {
                    SQR.modal.open(barcode.rawValue);
                }
            } else {
                setTimeout(checkQRUseBarcodeDetector, 2000);
            }
        })
        .catch(() => {
            console.error('Barcode Detection failed, boo.');
        })
    };

    /**
    * BarcodeDetector APIを使えるかどうかで処理を分岐
    */
    const findQR = () => {
        window.BarcodeDetector
        ? checkQRUseBarcodeDetector()
        : checkQRUseLibrary()
    };

    /**
    * デバイスのカメラを起動
    */
    const initCamera = () => {
        navigator.mediaDevices.getUserMedia({
            video: {facingMode: 'environment', width: 1920, height: 1080, framerate:60},
            audio: false
        })
        .then((stream) => {
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
                findQR();
            };
        })
        .catch((err) => {
            alert(err);
        });
    };

    return {
        initCamera,
        findQR,
    };
})();

if (SQR.reader) SQR.reader.initCamera();

//サークル名の表示
document.querySelector('#name').innerText=roomname;

function showinfo(id){
    document.getElementById("message").innerText=id;
    location.hash='detail';
    setTimeout(SQR.reader.findQR,1000);//1回読み取ったあとはしばらく待ってから読み取り開始しないと連続で読み取られる
    setTimeout(()=>{location.hash=';'},6000)
}