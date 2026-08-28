from functools import wraps
from firebase_admin import auth as firebase_auth
from django.http import JsonResponse
from config.firebase_config import initialize_firebase

db = initialize_firebase()

def requiere_auth(roles_permitidos=None):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):

            header = request.headers.get("Authorization", "")

            if not header.startswith("Bearer "):
                return JsonResponse({"error": "No autorizado"}, status=401)

            token = header.split(" ")[1]

            try:
                decoded = firebase_auth.verify_id_token(token)
                request.uid = decoded["uid"]
            except Exception as e:
                return JsonResponse({"error": "Token inválido", "detalle": str(e)}, status=401)

            if roles_permitidos:

                user_doc = db.collection("usuarios").document(request.uid).get()

                if not user_doc.exists:
                    return JsonResponse({"error": "Usuario no encontrado"}, status=404)

                rol = user_doc.to_dict().get("tipo_usuario", "usuario")
                request.rol = rol

                if rol not in roles_permitidos:
                    return JsonResponse({"error": "Permisos insuficientes"}, status=403)

            return view_func(request, *args, **kwargs)

        return wrapper
    return decorator