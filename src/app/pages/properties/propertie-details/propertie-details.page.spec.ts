import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertieDetailsPage } from './propertie-details.page';

describe('PropertieDetailsPage', () => {
  let component: PropertieDetailsPage;
  let fixture: ComponentFixture<PropertieDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertieDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
