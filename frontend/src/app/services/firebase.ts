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
  increment,
  serverTimestamp,
  query,
  orderBy,
  where,
  limit,
  getDocs
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
    const eventosRef = collection(this.firestore, 'events');
    return collectionData(eventosRef, { idField: 'id' }) as Observable<any[]>;
  }

  async obtenerEventoUnaVez(id: string): Promise<any | null> {
    const eventoRef = doc(this.firestore, `events/${id}`);
    const snapshot = await getDoc(eventoRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data()
    };
  }

  async crearEvento(evento: any) {

    const eventosRef =
      collection(this.firestore, 'events');

    const nuevoEvento = {

      ...evento,

      likes: 0,

      usuariosLike: [],

      asistentes: []

    };

    return await addDoc(
      eventosRef,
      nuevoEvento
    );

  }

  async eliminarEvento(id: string) {
    const eventoDoc = doc(this.firestore, `events/${id}`);
    return await deleteDoc(eventoDoc);
  }

  async toggleLike(eventoId: string, uid: string, dioLike: boolean) {
    const eventoRef = doc(this.firestore, `events/${eventoId}`);

    if (dioLike) {

      await updateDoc(
        eventoRef,
        {
          usuariosLike: arrayRemove(uid),
          likes: increment(-1)
        }
      );

    } else {

      await updateDoc(
        eventoRef,
        {
          usuariosLike: arrayUnion(uid),
          likes: increment(1)
        }
      );

    }
  }

  obtenerEvento(id: string) {
    const eventoRef = doc(this.firestore, `events/${id}`);
    return docData(eventoRef, { idField: 'id' });
  }

  // =========================
  // FAVORITOS
  // =========================

  async toggleFavorito(
    eventoId: string,
    uid: string,
    esFavorito: boolean
  ) {

    const favoritoRef =
      doc(
        this.firestore,
        `usuarios/${uid}/favoritos/${eventoId}`
      );

    if (esFavorito) {

      await deleteDoc(favoritoRef);

    } else {

      await setDoc(
        favoritoRef,
        {
          eventoId,
          fecha: new Date()
        }
      );

    }

  }

  obtenerFavoritos(uid: string) {

    const favoritosRef =
      collection(
        this.firestore,
        `usuarios/${uid}/favoritos`
      );

    return collectionData(
      favoritosRef,
      { idField: 'id' }
    );

  }

  // =========================
  // USUARIOS
  // =========================

  async guardarUsuario(usuario: Usuario) {

    try {

      const usuarioRef =
        doc(
          this.firestore,
          `usuarios/${usuario.uid}`
        );

      const usuarioExistente =
        await getDoc(usuarioRef);

      // =========================
      // CREAR USUARIO
      // =========================

      if (!usuarioExistente.exists()) {

        await setDoc(
          usuarioRef,
          {
            ...usuario,

            tipo_usuario:
              usuario.tipo_usuario || 'usuario',

            descripcion:
              usuario.descripcion || '',

            fotoURL:
              usuario.fotoURL || '',

            FechaCreacion:
              usuario.FechaCreacion || new Date(),

            ultimaconexion:
              new Date()
          }
        );

        console.log(
          '✅ Usuario guardado en Firestore'
        );

      }

      // =========================
      // USUARIO YA EXISTENTE
      // =========================

      else {

        await setDoc(
          usuarioRef,
          {
            ultimaconexion: new Date()
          },
          {
            merge: true
          }
        );

        console.log(
          '🔄 Usuario actualizado'
        );

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
      collection(
        this.firestore,
        'usuarios'
      );

    return collectionData(
      usuariosRef,
      { idField: 'id' }
    ) as Observable<Usuario[]>;

  }

  obtenerUsuario(uid: string) {

    const usuarioRef =
      doc(
        this.firestore,
        `usuarios/${uid}`
      );

    return docData(
      usuarioRef,
      { idField: 'id' }
    );

  }

  async actualizarPerfil(
    uid: string,
    datos: any
  ) {

    const usuarioRef =
      doc(
        this.firestore,
        `usuarios/${uid}`
      );

    return await updateDoc(
      usuarioRef,
      datos
    );

  }

  // =========================
  // CHAT
  // =========================

  async crearChat(
    chatId: string,
    participantes: string[]
  ) {

    try {

      const chatRef =
        doc(
          this.firestore,
          `chats/${chatId}`
        );

      // Crear el chat solamente si no existe.
      // merge evita problemas si posteriormente se agregan más campos.
      await setDoc(
        chatRef,
        {
          participantes: participantes,
          creado: serverTimestamp()
        },
        {
          merge: true
        }
      );

      console.log(
        '✅ Chat creado/confirmado:',
        chatId
      );

    } catch (error) {

      console.error(
        '❌ Error creando chat:',
        error
      );

      throw error;

    }

  }

  async enviarMensaje(
    chatId: string,
    texto: string,
    emisor: string
  ) {

    // =========================
    // 1. GUARDAR MENSAJE
    // =========================

    const mensajesRef =
      collection(
        this.firestore,
        `chats/${chatId}/mensajes`
      );

    await addDoc(
      mensajesRef,
      {
        texto: texto,
        emisor: emisor,
        fecha: serverTimestamp()
      }
    );

    // =========================
    // 2. OBTENER CHAT
    // =========================

    const chatRef =
      doc(
        this.firestore,
        `chats/${chatId}`
      );

    const chatSnapshot =
      await getDoc(chatRef);

    if (!chatSnapshot.exists()) {

      console.error(
        '❌ No existe el chat:',
        chatId
      );

      return;

    }

    // =========================
    // 3. OBTENER PARTICIPANTES
    // =========================

    const chatData: any =
      chatSnapshot.data();

    const participantes: string[] =
      chatData.participantes || [];

    console.log(
      '👥 Participantes:',
      participantes
    );

    // =========================
    // 4. BUSCAR DESTINATARIO
    // =========================

    const destinatario =
      participantes.find(
        uid => uid !== emisor
      );

    if (!destinatario) {

      console.error(
        '❌ No se encontró destinatario'
      );

      return;

    }

    console.log(
      '📨 Destinatario:',
      destinatario
    );

    const emisorRef =
      doc(
        this.firestore,
        `usuarios/${emisor}`
      );

    const emisorSnapshot =
      await getDoc(emisorRef);

    let nombreEmisor = 'Usuario';
    let fotoEmisor = '';

    if (emisorSnapshot.exists()) {

      const datosEmisor: any =
        emisorSnapshot.data();

      nombreEmisor =
        datosEmisor.nombre || 'Usuario';

      fotoEmisor =
        datosEmisor.fotoURL || '';

    }

    // =========================
    // 5. CREAR NOTIFICACIÓN
    // =========================

    await this.crearNotificacion(
      destinatario,
      {
        tipo: 'mensaje',

        titulo: nombreEmisor,

        texto: texto,

        fotoURL: fotoEmisor,

        chatId: chatId,

        emisor: emisor
      }
    );

    console.log(
      '🔔 Notificación creada'
    );

  }

  obtenerMensajes(chatId: string) {

    const mensajesRef =
      collection(
        this.firestore,
        `chats/${chatId}/mensajes`
      );

    const q =
      query(
        mensajesRef,
        orderBy('fecha')
      );

    return collectionData(
      q,
      { idField: 'id' }
    );

  }

  // =========================
  // NOTIFICACIONES
  // =========================

  async crearNotificacion(
    uidDestino: string,
    notificacion: any
  ) {

    const notificacionesRef =
      collection(
        this.firestore,
        `notificaciones/${uidDestino}/items`
      );

    return await addDoc(
      notificacionesRef,
      {
        ...notificacion,

        leida: false,

        fecha: serverTimestamp()
      }
    );

  }

  obtenerNotificaciones(uid: string) {

    const notificacionesRef =
      collection(
        this.firestore,
        `notificaciones/${uid}/items`
      );

    const q =
      query(
        notificacionesRef,
        orderBy('fecha', 'desc')
      );

    return collectionData(
      q,
      { idField: 'id' }
    );

  }

  async marcarNotificacionLeida(
    uid: string,
    notificacionId: string
  ) {

    const notificacionRef =
      doc(
        this.firestore,
        `notificaciones/${uid}/items/${notificacionId}`
      );

    return await updateDoc(
      notificacionRef,
      {
        leida: true
      }
    );

  }

  // =====================================================
  // MARCAR TODAS LAS NOTIFICACIONES DE UN CHAT COMO LEÍDAS
  // =====================================================

  async marcarNotificacionesChatLeidas(
    uid: string,
    chatId: string
  ) {

    const notificacionesRef =
      collection(
        this.firestore,
        `notificaciones/${uid}/items`
      );

    const q =
      query(
        notificacionesRef,
        where('chatId', '==', chatId)
      );

    const snapshot =
      await getDocs(q);

    const actualizaciones =
      snapshot.docs
        .filter(docSnap => {

          const datos: any =
            docSnap.data();

          return (
            datos.tipo === 'mensaje' &&
            datos.leida === false
          );

        })
        .map(docSnap =>

          updateDoc(
            doc(
              this.firestore,
              `notificaciones/${uid}/items/${docSnap.id}`
            ),
            {
              leida: true
            }
          )

        );

    await Promise.all(
      actualizaciones
    );

    console.log(
      '✅ Notificaciones del chat marcadas como leídas:',
      chatId
    );

  }

  // =========================================================
  // ASISTENCIAS DE EVENTOS
  // =========================================================

  async obtenerAsistentes(
    eventoId: string
  ): Promise<string[]> {

    const eventoRef =
      doc(
        this.firestore,
        `events/${eventoId}`
      );

    const snapshot =
      await getDoc(eventoRef);

    if (!snapshot.exists()) {
      return [];
    }

    const datos: any =
      snapshot.data();

    return datos.asistentes || [];

  }

  // =========================================================
  // CANTIDAD DE ASISTENTES
  // =========================================================

  async obtenerCantidadAsistentes(
    eventoId: string
  ): Promise<number> {

    const asistentes =
      await this.obtenerAsistentes(
        eventoId
      );

    return asistentes.length;

  }

  async obtenerChatsUsuario(
    uid: string
  ): Promise<any[]> {

    const chatsRef =
      collection(
        this.firestore,
        'chats'
      );

    const q =
      query(
        chatsRef,
        where(
          'participantes',
          'array-contains',
          uid
        )
      );

    const snapshot =
      await getDocs(q);

    const chats: any[] = [];

    for (const documento of snapshot.docs) {

      const chat =
        documento.data();

      const mensajesRef =
        collection(
          this.firestore,
          `chats/${documento.id}/mensajes`
        );

      const mensajesQuery =
        query(
          mensajesRef,
          orderBy('fecha', 'desc'),
          limit(1)
        );

      const mensajesSnapshot =
        await getDocs(
          mensajesQuery
        );

      // 🚨 Si nunca hubo mensajes, NO es una conversación
      if (mensajesSnapshot.empty) {
        continue;
      }

      const mensajeDoc =
        mensajesSnapshot.docs[0];

      const ultimoMensaje = {
        id: mensajeDoc.id,
        ...mensajeDoc.data()
      };

      chats.push({
        id: documento.id,

        ...chat,

        ultimoMensaje
      });

    }

    // Ordenar por mensaje más reciente
    chats.sort((a, b) => {

      const fechaA =
        a.ultimoMensaje
          ?.fecha
          ?.toMillis?.() || 0;

      const fechaB =
        b.ultimoMensaje
          ?.fecha
          ?.toMillis?.() || 0;

      return fechaB - fechaA;

    });

    return chats;

  }

  obtenerOtroParticipante(
    participantes: string[],
    uidActual: string
  ): string | null {

    return participantes.find(
      uid => uid !== uidActual
    ) || null;

  }

}
