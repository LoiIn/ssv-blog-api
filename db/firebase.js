const { initializeApp } = require("firebase/app");
const {
  ref,
  uploadString,
  getStorage,
  getDownloadURL,
} = require("firebase/storage");
const randomString = require("random-string");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5cBtnhUSVD7U7UN_hw5T---yZXaznPkQ",
  authDomain: "fir-sample2-c12cf.firebaseapp.com",
  projectId: "fir-sample2-c12cf",
  storageBucket: "fir-sample2-c12cf.appspot.com",
  messagingSenderId: "926458286200",
  appId: "1:926458286200:web:1aef958e0cab7475dddd8d",
};

// Initialize Firebase
const fileDB = initializeApp(firebaseConfig);
const storage = getStorage(fileDB);

exports.addImage = async (base64Str) => {
  try {
    if (!base64Str) return "";
    const base64Regex = /data[^,]+base64,/i;
    base64Str = base64Str.replace(base64Regex, "");
    let str = randomString(10);
    let fileName = `images/posts/post-${str}-${Date.now()}.png`;
    const imageRef = ref(storage, fileName);
    await uploadString(imageRef, base64Str, "base64", {
      contentType: "image/png",
    });
    const downloadUrl = await getDownloadURL(imageRef);
    return downloadUrl;
  } catch (err) {
    console.log(err);
    return "";
  }
};
