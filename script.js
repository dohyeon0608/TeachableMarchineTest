// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "./my_model/";

let model, image, labelContainer, maxPredictions;

let isToggledWebcam = false;
let isInited = false;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    labelContainer = document.getElementById("label-container");
    for (let i = 0; i <= maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }

    isInited = true;
}

function clear_label_container() {
    console.log('it works');
    maxPredictions = model.getTotalClasses();
    for (let i = 0; i <= maxPredictions; i++) { // and class labels
        labelContainer.childNodes[i].innerHTML = '';
    }
}

// Load the image model and setup the webcam
async function init_webcam() {
    document.getElementById('upload_file').innerHTML = '';
    document.getElementById("image-container").innerHTML = '';
    if (!isInited) {
        await init();
    }

    if (!isToggledWebcam) {
        isToggledWebcam = true;

        // Convenience function to setup a webcam
        const flip = true; // whether to flip the webcam
        image = new tmImage.Webcam(200, 200, flip); // width, height, flip
        await image.setup(); // request access to the webcam
        await image.play();
        window.requestAnimationFrame(loop);

        // append elements to the DOM
        document.getElementById("image-container").appendChild(image.canvas);

        document.getElementById("webcam_button").innerHTML = "Stop Webcam";
    } else {
        isToggledWebcam = false;
        image.stop();
        document.getElementById("image-container").innerHTML = '';
        document.getElementById("webcam_button").innerHTML = "Start <i>with Webcam</i>";
        clear_label_container(); // Unfortunately, It's not working.
    }
}

async function init_file() {
    if (!isInited) {
        await init();
    }

    document.getElementById('upload_file').innerHTML = '<input type="file" id="fileUpload" accept="image/*">\nPlease upload your file to predict.';
    document.getElementById("image-container").innerHTML = '<img id="previewImg" width="200" heigth="200" alt="미리보기 이미지">';

    const fileInput = document.getElementById("fileUpload");

    const handleFiles = () => {
        const selectedFile = fileInput.files[0];

        const fileReader = new FileReader();

        fileReader.readAsDataURL(selectedFile);

        fileReader.onload = function () {
            document.getElementById("previewImg").src = fileReader.result;
            image = document.getElementById("previewImg");
            predict()
        };
    };

    fileInput.addEventListener("change", handleFiles);

}

async function loop() {
    image.update(); // update the webcam frame
    await predict();
    if (isToggledWebcam) {
        window.requestAnimationFrame(loop);
    }
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    let prediction;
    if (image instanceof tmImage.Webcam) {
        prediction = await model.predict(image.canvas);
    } else {
        await model.predict(image) // I don't know why it works when I called predict funcion twice.
        prediction = await model.predict(image);
    }

    if (prediction[0].className == "Dog" && prediction[0].probability.toFixed(2) == 1.00) {
        labelContainer.childNodes[0].innerHTML = "개는 중형 동물이자 가장 널리 분포하며 개체 수가 가장 많은 지상 동물 중 하나이며 가축화한 회색늑대이다. 개는 인류가 최초로 가축으로 삼은 동물로 알려져 있으며, 역사적으로 반려견, 사냥견으로서 길러 왔다.";
    } else if (prediction[1].className == "Cat" && prediction[1].probability.toFixed(2) == 1.00) {
        labelContainer.childNodes[0].innerHTML = "고양이는 식육목 고양이과에 속하는 포유류이다. 집고양이의 기원은 약 1만년 전 중동 지역에서 스스로 숲속을 나와 사람들이 모여사는 마을에 정착하여 길들여진 아프리카들고양이로 추측된다.";
    } else {
        labelContainer.childNodes[0].innerHTML = "알 수 없다.";
    }

    for (let i = 0; i < maxPredictions; i++) {
        j = i + 1;
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[j].innerHTML = classPrediction;
    }
}