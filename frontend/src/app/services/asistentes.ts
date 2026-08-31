import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc
} from '@angular/fire/firestore';

import { Auth, authState } from '@angular/fire/auth';

import {
  Observable,
  of,
  switchMap,
  map,
  forkJoin,
  combineLatest
} from 'rxjs';

import { FirebaseService } from './firebase';


@Injectable({
  providedIn: 'root'
})
export class AsistentesService {

  private firestore = inject(Firestore);
  private auth = inject(Auth);


  constructor(
    private firebaseService: FirebaseService
  ) { }


  // =========================================================
  // OBTENER EVENTO
  // =========================================================

  private obtenerEvento(eventoId: string): Observable<any> {

    const eventoRef = doc(
      this.firestore,
      `events/${eventoId}`
    );

    return docData(eventoRef);

  }


  // =========================================================
  // OBTENER LISTA DE ASISTENTES
  // =========================================================

  // =========================================================
  // OBTENER LISTA DE ASISTENTES CON DATOS DEL USUARIO
  // =========================================================

  // =========================================================
// OBTENER DATOS DE LOS ASISTENTES
// =========================================================

obtenerAsistentes(eventoId: string): Observable<any[]> {

  return this.obtenerEvento(eventoId).pipe(

    switchMap((evento: any) => {

      const uids: string[] =
        evento?.asistentes || [];

      console.log(
        '👥 UIDs de asistentes:',
        uids
      );

      // No hay asistentes
      if (uids.length === 0) {

        return of([]);

      }

      // =========================================
      // BUSCAR CADA USUARIO DIRECTAMENTE
      // =========================================

      const consultas =
        uids.map(uid => {

          const usuarioRef = doc(
            this.firestore,
            `usuarios/${uid}`
          );

          return docData(usuarioRef, {
            idField: 'uid'
          }).pipe(

            map((usuario: any) => {

              if (!usuario) {

                console.warn(
                  '⚠️ No se encontró usuario:',
                  uid
                );

                return null;

              }

              console.log(
                '👤 Asistente encontrado:',
                usuario
              );

              console.log(
                '🆔 UID:',
                uid
              );

              console.log(
                '📝 Nombre:',
                usuario.nombre
              );

              console.log(
                '📧 Email:',
                usuario.email
              );

              return {
                ...usuario,
                uid: uid
              };

            })

          );

        });


      // =========================================
      // ESPERAR A TODOS LOS USUARIOS
      // =========================================

      return combineLatest(consultas).pipe(

        map((usuarios) => {

          const resultado =
            usuarios.filter(
              usuario => usuario !== null
            );

          console.log(
            '🔥🔥🔥 ASISTENTES COMPLETOS:',
            resultado
          );

          return resultado;

        })

      );

    })

  );

}




  // =========================================================
  // OBTENER CANTIDAD DE ASISTENTES
  // =========================================================

  obtenerCantidad(eventoId: string): Observable<number> {

    const eventoRef = doc(
      this.firestore,
      `events/${eventoId}`
    );

    return docData(eventoRef).pipe(

      map((evento: any) => {

        const asistentes =
          evento?.asistentes || [];

        console.log(
          '👥 Asistentes actuales:',
          asistentes
        );

        console.log(
          '🔢 Cantidad de asistentes:',
          asistentes.length
        );

        return asistentes.length;

      })

    );

  }

  // =========================================================
  // OBTENER CANTIDAD DE ASISTENTES UNA SOLA VEZ
  // =========================================================

  async obtenerCantidadUnaVez(eventoId: string): Promise<number> {

    const eventoRef = doc(
      this.firestore,
      `events/${eventoId}`
    );

    const snapshot = await getDoc(eventoRef);

    if (!snapshot.exists()) {

      console.warn(
        '⚠️ El evento no existe:',
        eventoId
      );

      return 0;
    }

    const evento: any = snapshot.data();

    const asistentes =
      evento?.asistentes || [];

    console.log(
      '👥 Asistentes obtenidos al abrir evento:',
      asistentes
    );

    console.log(
      '🔢 Cantidad inicial:',
      asistentes.length
    );

    return asistentes.length;
  }


  // =========================================================
  // SABER SI EL USUARIO YA ASISTE
  // =========================================================

  estaAsistiendo(eventoId: string): Observable<boolean> {

    return authState(this.auth).pipe(

      switchMap(usuario => {

        if (!usuario) {
          return of(false);
        }

        const eventoRef = doc(
          this.firestore,
          `events/${eventoId}`
        );

        return docData(eventoRef).pipe(

          map((evento: any) => {

            const asistentes =
              evento?.asistentes || [];

            return asistentes.includes(
              usuario.uid
            );

          })

        );

      })

    );

  }


  // =========================================================
  // AGREGAR ASISTENCIA
  // =========================================================

  async asistir(
    eventoId: string,
    creadorId: string,
    eventoTitulo: string
  ): Promise<void> {

    const usuario = this.auth.currentUser;

    console.log(
      '👤 Usuario Firebase:',
      usuario?.uid
    );

    console.log(
      '🎫 Evento:',
      eventoId
    );

    console.log(
      '👑 Creador:',
      creadorId
    );


    // =======================================================
    // VERIFICAR USUARIO
    // =======================================================

    if (!usuario) {

      throw new Error(
        'El usuario debe iniciar sesión'
      );

    }


    // =======================================================
    // REFERENCIA DEL EVENTO
    // =======================================================

    const eventoRef = doc(
      this.firestore,
      `events/${eventoId}`
    );


    // =======================================================
    // AGREGAR UID A ASISTENTES
    // =======================================================

    await updateDoc(
      eventoRef,
      {
        asistentes: arrayUnion(usuario.uid)
      }
    );


    console.log(
      '✅ Asistencia guardada en el evento'
    );


    // =======================================================
    // NOTIFICACIÓN AL CREADOR
    // =======================================================

    if (
      creadorId &&
      creadorId !== usuario.uid
    ) {

      await this.firebaseService.crearNotificacion(
        creadorId,
        {
          tipo: 'asistencia',

          titulo:
            'Nueva asistencia',

          texto:
            `${usuario.displayName || 'Un usuario'} va a asistir a tu evento "${eventoTitulo}"`,

          eventoId:
            eventoId,

          usuarioId:
            usuario.uid
        }
      );


      console.log(
        '🔔 Notificación de asistencia creada'
      );

    } else {

      console.log(
        'ℹ️ No se creó notificación porque el usuario es el creador del evento'
      );

    }

  }


  // =========================================================
  // CANCELAR ASISTENCIA
  // =========================================================

  async cancelarAsistencia(
    eventoId: string
  ): Promise<void> {

    const usuario =
      this.auth.currentUser;


    // =======================================================
    // VERIFICAR USUARIO
    // =======================================================

    if (!usuario) {

      throw new Error(
        'El usuario debe iniciar sesión'
      );

    }


    // =======================================================
    // REFERENCIA DEL EVENTO
    // =======================================================

    const eventoRef = doc(
      this.firestore,
      `events/${eventoId}`
    );


    // =======================================================
    // ELIMINAR UID DEL ARRAY DE ASISTENTES
    // =======================================================

    await updateDoc(
      eventoRef,
      {
        asistentes:
          arrayRemove(usuario.uid)
      }
    );


    console.log(
      '❌ Asistencia eliminada del evento'
    );

  }

}