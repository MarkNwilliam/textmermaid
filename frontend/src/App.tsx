import "./css/style.css";

import { cleanInputText, isMermaidChart } from "./utils/utils";
import { useEffect, useState } from "react";
import Swal from 'sweetalert2'
import InputText from "./components/InputText";
import Mermaid from "./mermaid";

const App = () => {
  const [chart, setChart] = useState<string>("");
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    if (isMermaidChart(input)) {
      const cleanChart = cleanInputText(input);
      setChart(cleanChart);
    }
  }, [input]);

  return (
    <div className="flex flex-col w-full justify-start items-center mt-[3rem]">
      <span className="stat-value">text to Flow Diagram </span>
      <div className="flex flex-col w-full h-full mx-auto px-[10rem] mt-[3rem]">
        {/* Output text and flowchart */}
        <div className="flex w-full h-full gap-x-[1rem]">
          <div className="flex flex-1">
            <textarea
              className="textarea textarea-bordered w-full h-full"
              value={input}
              placeholder="Type your flow here..."
              // readOnly
            />
          </div>

          <div className="flex flex-1 w-full h-full border p-3 min-h-[40rem] max-h-[40rem] border-base-content/60 overflow-auto">
            <Mermaid chart={chart} />
          </div>
        </div>

        {/* Input text */}
        <InputText setInput={setInput} />
      </div>
    </div>
  );
};

export default App;
