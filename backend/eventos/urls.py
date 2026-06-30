from django.urls import path
from . import views
from .views import upload_image

urlpatterns = [

    path(
        'eventos/',
        views.listar_eventos
    ),

    path(
        'eventos/<str:evento_id>/',
        views.detalle_evento
    ),
        path(
        'upload-image/',
        upload_image,
        name='upload_image'
    ),
    path(
        'eventos/<str:evento_id>/like/',
        views.toggle_like
    ),
    path(
        'eventos/<str:evento_id>/favorito/',
        views.toggle_favorito
    ),


]