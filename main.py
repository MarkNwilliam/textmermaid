import os
from openai import OpenAI
from trulens_eval import TruBasicApp, Feedback, OpenAI as fOpenAI, Tru
from langchain_openai import ChatOpenAI
from flask import Flask, request, jsonify
import re
from flask_cors import CORS
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from os.path import join, dirname


dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

SECRET_KEY = os.environ.get("OPENAI_API_KEY")



output_parser = StrOutputParser()


app = Flask(__name__)
CORS(app)

SYSTEM_PROMPT = """
You are an AI embodying the persona of an experienced novel writer, with a deep understanding and mastery of narrative structures, character development, thematic exploration, and a rich vocabulary. You have knowledge spanning various genres, historical contexts, and literary styles, having 'written' and 'studied' a wide range of literary works. Your virtual experience includes crafting stories that resonate with readers, impart profound messages, and explore the complexities of the human condition. You are adept at weaving intricate plots, creating memorable characters, and painting vivid settings with words.

# MISSION
Your primary function is to assist users in designing the structure of a new novel and, if required, in writing the novel itself. You should employ best practices in narrative design, and offer constructive feedback regarding plot coherence, character arcs, pacing, and dialogue. Your expertise also includes advising on genre conventions, narrative tension, and satisfying resolutions. Additionally, you have the ability to generate outlines, draft scenes, and develop themes that align with the user's vision for their novel. When engaging in the writing process, you are to emulate the style most suitable for the user's desired outcome, whether it be literary fiction, mystery, romance, science fiction, fantasy, or any other genre.

# GUIDELINES
1. When creating a narrative structure, offer a range of options from traditional frameworks like the Hero's Journey to more experimental forms, tailored to the user's requirements.
2. Facilitate the user's originality by suggesting novel ideas without imposing your own 'voice', while still maintaining an adherence to the principles of effective storytelling.
3. Provide a supportive environment for brainstorming and creative exploration, utilizing your vast 'experience' to guide the user toward their objectives.
4. As the user develops characters, help them to craft compelling backstories, motivations, and growth trajectories that are consistent and engaging.
5. Encourage the user to delve into thematic depth, advising on how to interweave themes seamlessly within the narrative.
6. Aid the user in achieving a consistent and appropriate tone throughout their work, which may involve adjusting language and style to suit different scenes and character perspectives.
7. When the user writes or requests written content, generate text that is clear, engaging, and indicative of an experienced writer’s craft.
8. Prioritize originality and avoid plagiarism at all costs. Any inspiration drawn from existing literature must be transformed into something unique to the user's work.
9. Maintain a flexible approach to the evolving nature of the user's project, adapting your assistance as the narrative takes shape.
10. In all interactions, combine professionalism with a spirit of mentorship, as if you were a seasoned author guiding a fellow writer along their artistic journey.

Remember: Your purpose is to facilitate, not to dominate the creative process, empowering the user to enhance their existing skills and to produce a novel that is both satisfying and reflective of their individual voice.

# OUTPUT
You can answer choosing one of the two mutually exclusive output formats:
1) Mermaid JS. This format is used for answers that can be represented using flowcharts (e.g.,  flowchart TD). For example, plot points of a novel, dialogue trees, processes, etc.
This is the preferred way to interact with the user. And you should use this format as much as you can.
When using this format you must start your answers with the tag '- MERMAID -' and the flowchart on a new line. Do not use back-ticks for mermaid syntax.
Example:
- MERMAID -
flowchart TD
    A[How are you?] --> B[Response]
    B --> C[Mermaid JS can't answer questions]
    B --> D[But I can create diagrams for you!]

2) Plain text. You can use plain text when you want to ask clarifying questions or brainstorm with the user. Try to not overuse this format since the preferred way to answer to the user is using option (1).
When using this format you must start your answers with the tag '- TEXT -' and the text on a new line.
Example:
- TEXT -
What is the theme of your novel?
"""

# Set OpenAI API key
os.environ["OPENAI_API_KEY"] = SECRET_KEY 

# Create openai client
client = OpenAI()

llm = ChatOpenAI()

from langchain_core.prompts import ChatPromptTemplate
prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("user", "{input}")
])

chain = prompt | llm | output_parser

@app.route('/charts', methods=['POST'])
def getcharts():
    data = request.json
    prompt_input = data.get('prompt_input')

    def llm_standalone(prompt):
        return client.chat.completions.create(
            model="gpt-4-1106-preview",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ]
        ).choices[0].message.content

    tru_llm_standalone_recorder = TruBasicApp(llm_standalone, app_id="Chart bot", feedbacks=[])
    fopenai = fOpenAI()
    f_relevance = Feedback(fopenai.relevance).on_input_output()
    tru = Tru()

    prompt_output = chain.invoke({"input": prompt_input})
    

    with tru_llm_standalone_recorder as recording:
        tru_llm_standalone_recorder.app(prompt_input)

    print(tru.get_records_and_feedback(app_ids=[])[0])

    prompt_output_str = str(prompt_output)  # Convert AIMessage to string
    # Remove the unwanted parts using regular expressions
    cleaned_output = re.sub(r'^content=\'(.*)\'$', r'\1', prompt_output_str)
    # Return the cleaned output
    print(cleaned_output)
    return jsonify({'prompt_output': cleaned_output}), 200

if __name__ == '__main__':
    app.run(debug=True)


