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
serverTimestamp,
query,
orderBy
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';

import { Usuario } from '../models/usuario';

@Injectable({
providedIn: 'root'
})
export class FirebaseService {

private firestore = inject(Firestore);

constructor() {}

// =========================
// EVENTOS
// =========================

obtenerEventos(): Observable<any[]> {

const eventosRef =
  collection(this.firestore, 'eventos');

return collectionData(
  eventosRef,
  {
    idField: 'id'
  }
) as Observable<any[]>;

}

async crearEvento(evento: any) {

const eventosRef =
  collection(this.firestore, 'eventos');

return await addDoc(
  eventosRef,
  evento
);

}

async eliminarEvento(id: string) {

const eventoDoc =
  doc(this.firestore, `eventos/${id}`);

return await deleteDoc(
  eventoDoc
);

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
async crearChat(
  chatId: string,
  participantes: string[]
) {

  const chatRef =
    doc(this.firestore, `chats/${chatId}`);

  const chatExistente =
    await getDoc(chatRef);

  if (!chatExistente.exists()) {

    await setDoc(
      chatRef,
      {
        participantes,
        creado: new Date()
      }
    );

    console.log('✅ Chat creado');

  } else {

    console.log('✅ El chat ya existe');

  }

}
async enviarMensaje(
  chatId: string,
  texto: string,
  emisor: string
) {

  const mensajesRef = collection(
    this.firestore,
    `chats/${chatId}/mensajes`
  );

  return await addDoc(
    mensajesRef,
    {
      texto,
      emisor,
      fecha: serverTimestamp()
    }
  );

}
obtenerMensajes(chatId: string) {

  const mensajesRef = collection(
    this.firestore,
    `chats/${chatId}/mensajes`
  );

  const q = query(
    mensajesRef,
    orderBy('fecha')
  );

  return collectionData(
    q,
    {
      idField: 'id'
    }
  );

}

}