import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpgradePlanPage } from './upgrade-plan.page';

describe('UpgradePlanPage', () => {
  let component: UpgradePlanPage;
  let fixture: ComponentFixture<UpgradePlanPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UpgradePlanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
