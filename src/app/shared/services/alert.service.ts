import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private toastr: ToastrService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  showSuccess(message: string, title?: string, options?: any): void {
    this.toastr.success(message, title, options);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  showError(message: string, title?: string, options?: any): void {
    this.toastr.error(message, title, options);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  showWarning(message: string, title?: string, options?: any): void {
    this.toastr.warning(message, title, options);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  showInfo(message: string, title?: string, options?: any): void {
    this.toastr.info(message, title, options);
  }
}
