import React, { useState,useContext,useEffect } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";
// import React, { useState,  useEffect } from "react";
import GetAnswer from "../Services/FetchData";
import { Typewriter } from "react-simple-typewriter";
import { MyContext } from "../Store/ContextStore";
 
const Chat = () => {
  const [isRecognitionActive, setRecognitionActive] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [silenceTimer, setSilenceTimer] = useState(null);
  const [finalResult, setFinalResult] = useState("");

  const { AllQuestions, SetAllQuestions } = useContext(MyContext);
  const [response, setResponse] = useState(null);
  const [query, setQuery] = useState("");
  const [Allanswer, SetAnswer] = useState([]);
  const [disable, setDisable] = useState(false);
  const [rvReady, setRvReady] = useState(false);
  const [Play, SetPlay] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://code.responsivevoice.org/responsivevoice.js?key=Pj0JikQu";
    script.async = true;

    script.onload = () => {
      console.log("ResponsiveVoice loaded successfully");
      setRvReady(true);
    };

    script.onerror = () => {
      console.error("Failed to load ResponsiveVoice script");
    };

    document.body.appendChild(script);
  }, []);

  const submitQuery = async () => {
    if (query.trim()) {
      SetAllQuestions((prev) => [...prev, query]);
      const currentQuery = query;
      setQuery("");
      await fetchData(currentQuery);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitQuery();
    }
  };

  const handleChange = (event) => {
    setQuery(event.target.value);
  };

  const fetchData = async (queryText) => {
    try {
      setDisable(false);
      const text = await GetAnswer(queryText);
      const cleanText = text.split("*").join("");
      if (text) {
        setDisable(true);
      }

      setResponse(cleanText);
      SetAnswer((prev) => [...prev, cleanText]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSpeak = (text, index) => {
    const iconId = `icon-${index}`;
  let i = document.querySelector(`#${iconId}`);

    if (!Play) {
      console.log("play", Play);
      i.classList = "fa-solid fa-pause";

      if ("speechSynthesis" in window) {
        // Cancel any previous speech
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = speechSynthesis
          .getVoices()
          .find((voice) => voice.name === "Google UK English Female");
        utterance.pitch = 1;
        utterance.rate = 1;
        utterance.volume = 1;

        utterance.onend = () => {
          SetPlay(false);
          i.classList = "fa-solid fa-play";
        };

        speechSynthesis.speak(utterance);
        console.log("Speaking text:", text);
      }

      SetPlay(true);
    } else {
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        speechSynthesis.pause();
        i.classList = "fa-solid fa-play";
        SetPlay(false);
      } else if (speechSynthesis.paused) {
        speechSynthesis.resume();
        i.classList = "fa-solid fa-pause";
        SetPlay(true);
      }
    }
  };

  //voice part
  useEffect(() => {
    // Load hand detection model
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      video.srcObject = stream;
      video.play();
    });

    const onResults = (results) => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks.length > 0 && !isRecognitionActive) {
        const hand = results.multiHandLandmarks[0];
        const wristY = hand[0].y;
        const fingerTipY = hand[8].y;

        if (wristY > fingerTipY) {
          console.log("Hand wave detected! Starting voice recognition...");
          startVoiceRecognition();
        }
      }
    };

    hands.onResults(onResults);

    const camera = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 640,
      height: 480,
    });
    camera.start();
  }, [isRecognitionActive]);

  // Start voice recognition
  const startVoiceRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition && !isRecognitionActive) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onstart = () => {
        console.log("Voice recognition started");
        setRecognitionActive(true);
        resetSilenceTimer();  // Start the silence timer when recognition starts
      };

      recognitionInstance.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
            
            setQuery(finalTranscript)
          }
        }
        console.log("Recognized text:", finalTranscript);//final speech result
        setFinalResult(finalTranscript);  // Store the result
        resetSilenceTimer();  // Reset the timer on each result
      };

      recognitionInstance.onerror = (event) => {
        console.error("Error in recognition:", event.error);
        stopVoiceRecognition();
      };

      // Store the recognition instance
      setRecognition(recognitionInstance);
      recognitionInstance.start();
    }
  };

  // Stop voice recognition
  const stopVoiceRecognition = () => {
    if (recognition) {
      recognition.stop();
      console.log("Voice recognition stopped. Final result:", finalResult);
      setRecognitionActive(false);
    }
    if (silenceTimer) {
      clearTimeout(silenceTimer);
    }
  };

  // Reset silence timer to stop recognition after 3 seconds of inactivity
  const resetSilenceTimer = () => {
    if (silenceTimer) {
      clearTimeout(silenceTimer);
    }
    const newTimer = setTimeout(() => {
      console.log("No speech detected for 3 seconds. Stopping recognition...");
      stopVoiceRecognition();
    }, 3000);  // Stop after 3 seconds of inactivity
    setSilenceTimer(newTimer);
  };

  // Handle manual stop button click
  const handleManualStop = () => {
    stopVoiceRecognition();
  };

  // return (
  //   <div className="w-full min-h-[85vh] mt-[50px] md:mt-[0px]">
  //     <h1 className="text-center text-white">Wave Your Hand to Start Speaking!</h1>
  //     <video id="video" width="640" height="480" autoPlay style={{ display: "none" }}></video>
  //     <canvas id="canvas" width="640" height="480" style={{ display: "none" }}></canvas>
      
  //     <div className="text-center mt-4">
  //       <button
  //         onClick={handleManualStop}
  //         className="bg-red-500 text-white p-2 rounded"
  //       >
  //         Stop Recognition Manually
  //       </button>
  //     </div>
  //   </div>
  // );
  return <div>
    <video id="video" width="640" height="480" autoPlay style={{ display: "none" }}></video>
    <canvas id="canvas" width="640" height="480" style={{ display: "none" }}></canvas>
    <div className="w-full min-h-[85vh] mt-[50px] md:mt-[0px]">
      <div className="min-h-[85%] bg-black overflow-y-scroll p-4 pb-[80px]">
        {AllQuestions.length > 0 ? (
          AllQuestions.map((element, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-end">
                <div className="max-w-[75%] my-1 bg-purple-600 text-white rounded-lg p-3 shadow-lg">
                  {element}
                </div>
              </div>

              <div className="flex justify-start mt-2">
                {Allanswer[index] ? (
                  <div className="flex flex-col">
                    <div className="max-w-[75%] bg-gray-300 text-black rounded-lg p-3 shadow-lg">
                      <Typewriter
                        words={[Allanswer[index]]}
                        loop={1}
                        cursor
                        cursorStyle=""
                        typeSpeed={5}
                        deleteSpeed={50}
                        delaySpeed={1000}
                      />
                    </div>
                    <button
                      className="w-[30px] h-[30px] bg-white mt-2 rounded-full"
                      onClick={() => handleSpeak(Allanswer[index], index)}
                    >
                      <i id={`icon-${index}`} className="fa-solid fa-play"></i>{" "}
                    </button>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            No queries yet. Start the conversation! Sometimes it may provide the
            wrong answer.
          </div>
        )}
      </div>

      <div className="w-full fixed bottom-0 left-0 md:left-10 border-1 border-white bg-gray-600 text-white p-4 flex justify-center items-center gap-2">
        <textarea
          placeholder="Write Your Query Here..."
          className={`min-h-[50px] w-[80%] lg:w-[60%] text-white bg-black p-2 resize-none overflow-y-auto rounded-[10px] ${
            disable === true ? "disabled" : ""
          }`}
          rows="1"
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          value={query}
        ></textarea>
        <div
          onClick={submitQuery}
          className="w-[40px] cursor-pointer h-[40px] rounded-full flex justify-center items-center bg-purple-500"
        >
          <i className="fa-solid fa-paper-plane text-white"></i>
          {/* <button
          onClick={()=>{
            // setQuery(finalResult)
            handleManualStop()
          }
          }
          className="bg-red-500 text-white p-2 rounded"
        >
          Stop Recognition Manually
        </button> */}
        </div>
      </div>
    </div>
  </div>
};

export default Chat;
