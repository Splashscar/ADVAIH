import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudEventos } from './crud-eventos';

describe('CrudEventos', () => {
  let component: CrudEventos;
  let fixture: ComponentFixture<CrudEventos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudEventos],
    }).compileComponents();

    fixture = TestBed.createComponent(CrudEventos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
