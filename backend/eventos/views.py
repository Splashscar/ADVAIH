from django.http import JsonResponse
import json


def home(request):
    return JsonResponse({
        "mensaje": "API ADVAIH funcionando"
    })


def login(request):

    if request.method == "POST":

        data = json.loads(request.body)

        email = data.get("email")
        password = data.get("password")

        return JsonResponse({
            "success": True,
            "message": "Login exitoso"
        })

    return JsonResponse({
        "error": "Método no permitido"
    }, status=405)


def register(request):

    if request.method == "POST":

        data = json.loads(request.body)

        nombre = data.get("nombre")
        email = data.get("email")
        password = data.get("password")

        return JsonResponse({
            "success": True,
            "message": "Usuario registrado"
        })

    return JsonResponse({
        "error": "Método no permitido"
    }, status=405)


def listar_eventos(request):

    eventos = [
        {
            "id": 1,
            "nombre": "Concierto Rock"
        },
        {
            "id": 2,
            "nombre": "Torneo de Baloncesto"
        }
    ]

    return JsonResponse(eventos, safe=False)