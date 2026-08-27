import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  setDoc,
  deleteDoc
} from '@angular/fire/firestore';

import { Auth, authState } from '@angular/fire/auth';

import { Observable, of, switchMap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsistentesService {

  private firestore = inject(Firestore);
  private auth = inject(Auth);

  // =========================================================
  // OBTENER ASISTENTES
  // =========================================================

  obtenerAsistentes(eventoId: string): Observable<any[]> {

    const asistentesRef = collection(
      this.firestore,
      `events/${eventoId}/asistentes`
    );

    return collectionData(asistentesRef, {
      idField: 'uid'
    }) as Observable<any[]>;

  }


  // =========================================================
  // CONTADOR
  // =========================================================

  obtenerCantidad(eventoId: string): Observable<number> {

  return this.obtenerAsistentes(eventoId).pipe(

    map(asistentes => {

      console.log(
        '👥 Asistentes encontrados:',
        asistentes
      );

      console.log(
        '🔢 Cantidad:',
        asistentes.length
      );

      return asistentes.length;

    })

  );

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

      const asistenteRef = doc(
        this.firestore,
        `events/${eventoId}/asistentes/${usuario.uid}`
      );

      return docData(asistenteRef).pipe(
        map(asistente => !!asistente)
      );

    })

  );

}


  // =========================================================
  // AGREGAR ASISTENCIA
  // =========================================================

  async asistir(eventoId: string): Promise<void> {

  const usuario = this.auth.currentUser;

  console.log('👤 Usuario Firebase:', usuario?.uid);
  console.log('🎫 Evento:', eventoId);

  if (!usuario) {
    throw new Error('El usuario debe iniciar sesión');
  }

  const asistenteRef = doc(
    this.firestore,
    `events/${eventoId}/asistentes/${usuario.uid}`
  );

  console.log(
    '📍 Ruta asistencia:',
    `events/${eventoId}/asistentes/${usuario.uid}`
  );

  await setDoc(asistenteRef, {

    uid: usuario.uid,

    nombre: usuario.displayName || '',

    email: usuario.email || '',

    fechaRegistro: new Date()

  });

  console.log('✅ Asistencia creada correctamente');
}


  // =========================================================
  // CANCELAR ASISTENCIA
  // =========================================================

  async cancelarAsistencia(eventoId: string): Promise<void> {

    const usuario = this.auth.currentUser;

    if (!usuario) {
      throw new Error('El usuario debe iniciar sesión');
    }

    const asistenteRef = doc(
      this.firestore,
      `events/${eventoId}/asistentes/${usuario.uid}`
    );

    await deleteDoc(asistenteRef);

  }

}