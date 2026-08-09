import os
from google import genai


def preguntar_gemini(prompt):

    client = genai.Client(
        api_key=os.getenv("GEMINI_API_KEY")
    )

    respuesta = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return respuesta.text