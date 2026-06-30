import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatConversacion } from './chat-conversacion';

describe('ChatConversacion', () => {
  let component: ChatConversacion;
  let fixture: ComponentFixture<ChatConversacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatConversacion],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatConversacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
