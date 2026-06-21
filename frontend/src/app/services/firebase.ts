import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  deleteDoc
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private firestore = inject(Firestore);

  constructor() {}

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

}