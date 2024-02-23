import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { FC, useState } from "react";

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SYSTEM_PROMPT } from "../prompts/system_prompt";
import { StringOutputParser } from "@langchain/core/output_parsers";

import Swal from 'sweetalert2';


const model = new ChatOpenAI({
  temperature: 0.0,
  //   modelName: "gpt-4-1106-preview",
  modelName: "gpt-4-1106-preview",
  maxTokens: 1000,
  openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
});

const outputParser = new StringOutputParser();

type ChatHistory = (AIMessage | HumanMessage | SystemMessage)[];
const SystemPrompt = new SystemMessage(SYSTEM_PROMPT);

interface InputTextProps {
  setInput: (input: string) => void;
}

const InputText: FC<InputTextProps> = ({ setInput }) => {
  const [inputText, setInputText] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatHistory>([]);

  const invokeAPI = async () => {
    // Show progress alert
    const progressAlert = Swal.fire({
      title: 'Processing...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    });

    try {
      // Make POST request to the API endpoint
      const response = await fetch('http://127.0.0.1:5000/charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt_input: inputText })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      // Parse the response
      const data = await response.json();

     
      // Close progress alert
      await Swal.close();

      // Show success alert
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Message sent successfully.',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      // Set the input to the API response
      setInput(data.prompt_output);
      

      console.log(data.prompt_output);
      console.log(outputParser.parse(data.prompt_output));

    } catch (error) {
      console.error('Error:', error);
      // Close progress alert
      await Swal.close();
      // Show failure alert
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to send message. Please try again.',
      });
    }
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();
    await invokeAPI();
  };


  return (
    <form className="flex w-full mt-3 gap-x-3 items-center" onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Message the agent..."
        className="input input-bordered w-full"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <div className="flex w-[8rem]">
        <button type="submit" className="btn btn-secondary w-full">
          Send
        </button>
      </div>
    </form>
  );
};

export default InputText;
