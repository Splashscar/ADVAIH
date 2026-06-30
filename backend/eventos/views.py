from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from config.firebase_config import initialize_firebase
import json
import cloudinary
import cloudinary.uploader

db = initialize_firebase()

db = initialize_firebase()


@csrf_exempt
def listar_eventos(request):

    try:

        if request.method == 'GET':

            docs = db.collection('events').stream()

            eventos = []

            for doc in docs:

                evento = doc.to_dict()
                evento["id"] = doc.id

                eventos.append(evento)

            return JsonResponse(eventos, safe=False)

        elif request.method == 'POST':

            data = json.loads(request.body)

            nuevo_evento = {
                "title": data.get("title"),
                "location": data.get("location"),
                "date": data.get("date"),
                "description": data.get("description"),
                "category": data.get("category"),
                "imageUrl": data.get("imageUrl"),

                "authorId": data.get("authorId"),
                "authorName": data.get("authorName"),
                "authorEmail": data.get("authorEmail"),
                "authorPhoto": data.get("authorPhoto"),

                # ❤️ Likes
                "likes": 0,
                "usuariosLike": [],

                # ⭐ Favoritos
                "favoritos": 0,
                "usuariosFavoritos": []
            }

            doc_ref = db.collection('events').document()

            doc_ref.set(nuevo_evento)

            return JsonResponse({
                "mensaje": "Evento creado",
                "id": doc_ref.id
            })

    except Exception as e:

        return JsonResponse(
            {"error": str(e)},
            status=500
        )
@csrf_exempt
def detalle_evento(request, evento_id):

    try:

        if request.method == 'DELETE':

            db.collection('events')\
              .document(evento_id)\
              .delete()

            return JsonResponse({
                "mensaje": "Evento eliminado"
            })

        elif request.method == 'PUT':

            data = json.loads(request.body)

            db.collection('events')\
              .document(evento_id)\
              .update(data)

            return JsonResponse({
                "mensaje": "Evento actualizado"
            })

    except Exception as e:

        return JsonResponse(
            {"error": str(e)},
            status=500
        )
    
@csrf_exempt
def toggle_like(request, evento_id):

    try:

        if request.method != 'POST':

            return JsonResponse(
                {
                    "error": "Método no permitido"
                },
                status=405
            )

        data = json.loads(request.body)

        uid = data.get("uid")

        if not uid:

            return JsonResponse(
                {
                    "error": "UID requerido"
                },
                status=400
            )

        evento_ref = db.collection("events").document(evento_id)

        evento = evento_ref.get()

        if not evento.exists:

            return JsonResponse(
                {
                    "error": "Evento no encontrado"
                },
                status=404
            )

        datos = evento.to_dict()

        usuarios_like = datos.get("usuariosLike", [])

        likes = datos.get("likes", 0)

        if uid in usuarios_like:

            usuarios_like.remove(uid)

            likes -= 1

            dio_like = False

        else:

            usuarios_like.append(uid)

            likes += 1

            dio_like = True

        evento_ref.update({

            "usuariosLike": usuarios_like,

            "likes": likes

        })

        return JsonResponse({

            "likes": likes,

            "usuariosLike": usuarios_like,

            "dioLike": dio_like

        })

    except Exception as e:

        return JsonResponse(
            {
                "error": str(e)
            },
            status=500
        )
@csrf_exempt
def toggle_favorito(request, evento_id):

    try:

        if request.method != "POST":

            return JsonResponse(
                {"error":"Método no permitido"},
                status=405
            )

        data = json.loads(request.body)

        uid = data.get("uid")

        evento_ref = db.collection("events").document(evento_id)

        evento = evento_ref.get()

        if not evento.exists:

            return JsonResponse(
                {"error":"Evento no encontrado"},
                status=404
            )

        datos = evento.to_dict()

        usuarios = datos.get("usuariosFavoritos", [])

        favoritos = datos.get("favoritos", 0)

        if uid in usuarios:

            usuarios.remove(uid)

            favoritos -= 1

            activo = False

        else:

            usuarios.append(uid)

            favoritos += 1

            activo = True

        evento_ref.update({

            "usuariosFavoritos": usuarios,

            "favoritos": favoritos

        })

        return JsonResponse({

            "favoritos": favoritos,

            "usuariosFavoritos": usuarios,

            "activo": activo

        })

    except Exception as e:

        return JsonResponse(
            {"error":str(e)},
            status=500
        )
@csrf_exempt
def upload_image(request):

    if request.method == 'POST':

        image = request.FILES.get('image')

        result = cloudinary.uploader.upload(image)

        return JsonResponse({
            'url': result['secure_url']
        })

    return JsonResponse({
        'error': 'Método no permitido'
    }, status=405)