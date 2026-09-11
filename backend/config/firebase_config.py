import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()


def initialize_firebase():
    if not firebase_admin._apps:
        try:

            firebase_credentials = os.getenv("FIREBASE_CREDENTIALS")

            if firebase_credentials:
                print("🔐 Usando credenciales de Firebase desde variable de entorno")

                cred_dict = json.loads(firebase_credentials)
                cred = credentials.Certificate(cred_dict)

            else:
                base_dir = os.path.dirname(os.path.abspath(__file__))
                file_name = "serviceAccountKey.json"
                cert_path = os.path.join(base_dir, file_name)

                print(f"🔍 Buscando archivo de credenciales en: {cert_path}")

                if not os.path.exists(cert_path):
                    raise FileNotFoundError(
                        f"❌ No se encontró el archivo de credenciales en: {cert_path}"
                    )

                cred = credentials.Certificate(cert_path)

            firebase_admin.initialize_app(cred)

            print("✅ Firebase SDK inicializado correctamente")

        except Exception as e:
            print(f"❌ Error al inicializar Firebase: {e}")
            return None

    return firestore.client()