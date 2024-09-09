import { createContext, useState } from "react";

// Context Creation
export const MyContext = createContext();

// Context Provider
function Provide({ children }) {
  const [AllQuestions, SetAllQuestions] = useState([]);

  return (
    <MyContext.Provider value={{ AllQuestions, SetAllQuestions }}>
      {children}
    </MyContext.Provider>
  );
}

export default Provide;
