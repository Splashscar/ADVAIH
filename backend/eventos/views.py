from django.http import JsonResponse


def home(request):
    return JsonResponse({
        "mensaje": "API ADVAIH funcionando"
    })


def register(request):
    return JsonResponse({
        "mensaje": "Registro de usuario"
    })


def login(request):
    return JsonResponse({
        "mensaje": "Inicio de sesión"
    })


def listar_eventos(request):
    return JsonResponse({
        "mensaje": "Lista de eventos"
    })


def obtener_evento(request, evento_id):
    return JsonResponse({
        "mensaje": f"Evento {evento_id}"
    })


def listar_favoritos(request):
    return JsonResponse({
        "mensaje": "Favoritos del usuario"
    })