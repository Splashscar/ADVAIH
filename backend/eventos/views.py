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
    "authorPhoto": data.get("authorPhoto")
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