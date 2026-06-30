import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
  docData,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';

import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private firestore = inject(Firestore);

  constructor() { }

  // =========================
  // EVENTOS
  // =========================

  obtenerEventos(): Observable<any[]> {

    const eventosRef =
      collection(this.firestore, 'events');

    return collectionData(
      eventosRef,
      {
        idField: 'id'
      }
    ) as Observable<any[]>;

  }

  async crearEvento(evento: any) {

    const eventosRef =
      collection(this.firestore, 'events');

    const nuevoEvento = {

      ...evento,

      likes: 0,

      usuariosLike: []

    };

    return await addDoc(
      eventosRef,
      nuevoEvento
    );

  }

  async eliminarEvento(id: string) {

    const eventoDoc =
      doc(this.firestore, `events/${id}`);

    return await deleteDoc(
      eventoDoc
    );

  }

  async toggleLike(
    eventoId: string,
    uid: string,
    dioLike: boolean
  ) {

    const eventoRef =
      doc(this.firestore, `events/${eventoId}`);

    if (dioLike) {

      await updateDoc(eventoRef, {

        usuariosLike: arrayRemove(uid),

        likes: increment(-1)

      });

    } else {

      await updateDoc(eventoRef, {

        usuariosLike: arrayUnion(uid),

        likes: increment(1)

      });

    }

  }
  // =========================
// FAVORITOS
// =========================

async toggleFavorito(
  eventoId: string,
  uid: string,
  esFavorito: boolean
) {

  const favoritoRef = doc(
    this.firestore,
    `usuarios/${uid}/favoritos/${eventoId}`
  );

  if (esFavorito) {

    await deleteDoc(favoritoRef);

  } else {

    await setDoc(favoritoRef, {
      eventoId,
      fecha: new Date()
    });

    

  }

}

  // =========================
  // USUARIOS
  // =========================

  async guardarUsuario(usuario: Usuario) {

    try {

      const usuarioRef =
        doc(this.firestore, `usuarios/${usuario.uid}`);

      const usuarioExistente =
        await getDoc(usuarioRef);

      if (!usuarioExistente.exists()) {

        await setDoc(
          usuarioRef,
          usuario
        );

        console.log('✅ Usuario creado');

      } else {

        await setDoc(
          usuarioRef,
          {
            ultimaconexion: new Date()
          },
          {
            merge: true
          }
        );

        console.log('✅ Última conexión actualizada');

      }

    } catch (error) {

      console.error(
        '❌ Error guardando usuario',
        error
      );

      throw error;

    }

  }

  obtenerUsuarios(): Observable<Usuario[]> {

    const usuariosRef =
      collection(this.firestore, 'usuarios');

    return collectionData(
      usuariosRef,
      {
        idField: 'id'
      }
    ) as Observable<Usuario[]>;

  }

  obtenerUsuario(uid: string) {

    const usuarioRef =
      doc(this.firestore, `usuarios/${uid}`);

    return docData(
      usuarioRef,
      {
        idField: 'id'
      }
    );

  }
  obtenerFavoritos(uid: string) {

    const favoritosRef = collection(
      this.firestore,
      `usuarios/${uid}/favoritos`
    );

    return collectionData(
      favoritosRef,
      {
        idField: 'id'
      }
    );

  }
  obtenerEvento(id:string){

    const eventoRef =
      doc(this.firestore,
      `events/${id}`);

    return docData(
      eventoRef,
      {
        idField:'id'
      }
    );

  }

}