import { useContext } from "react";
import { MyContext } from "../Store/ContextStore";

function SideBar() {
  const { AllQuestions } = useContext(MyContext);
  console.log("all question", AllQuestions);

  return (
    <div className="w-full md:w-[20%] hidden md:block z-[10] bg-gray-600 min-h-[100vh] overflow-y-scroll">
      <button className="w-[80%] text-white font-bold text-2xl p-2">
        History
      </button>
      {AllQuestions && AllQuestions.length > 0 ? (
        <div className="overflow-y-auto">
          {AllQuestions.map((question, index) => (
            <div
              className="w-[80%] min-h-[30px] bg-purple-600 mx-2 px-2 rounded-sm my-1 text-white"
              key={index}
            >
              {question}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-white text-center p-2">No Questions Yet</div>
      )}
    </div>
  );
}

export default SideBar;
