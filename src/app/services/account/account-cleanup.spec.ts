import { TestBed } from '@angular/core/testing';
import { AccountCleanupService } from './account-cleanup';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';
import { EnvironmentInjector } from '@angular/core';

describe('AccountCleanupService', () => {
  let service: AccountCleanupService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AccountCleanupService,
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: { currentUser: null } },
        { provide: Storage, useValue: {} },
        {
          provide: EnvironmentInjector,
          useValue: { runInContext: (fn: any) => fn() },
        },
      ],
    });
    service = TestBed.inject(AccountCleanupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
