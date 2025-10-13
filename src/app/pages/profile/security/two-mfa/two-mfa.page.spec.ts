import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TwoMFAPage } from './two-mfa.page';

describe('TwoMFAPage', () => {
  let component: TwoMFAPage;
  let fixture: ComponentFixture<TwoMFAPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoMFAPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
