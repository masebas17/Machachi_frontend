import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { CertificateData } from '../shared/interfaces';
import {
  faCheckCircle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-verify-certificate',
  templateUrl: './verify-certificate.component.html',
  styleUrls: ['./verify-certificate.component.css'],
})
export class VerifyCertificateComponent implements OnInit {
  loading = true;
  valid = false;
  certificateData: CertificateData | null = null;
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;

  constructor(private apiService: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const hash = this.route.snapshot.paramMap.get('hash');
    if (hash) {
      this.verify(hash);
    } else {
      this.loading = false;
      this.valid = false;
    }
  }

  async verify(hash: string) {
    try {
      const response: any = await this.apiService.verifyCertificate(hash);
      if (response.success) {
        this.valid = true;
        const periodoBase = response.data.period;
        const periodoCompleto = `${periodoBase} - ${parseInt(periodoBase) + 1}`;

        this.certificateData = {
          studentName: response.data.studentName,
          level: response.data.level,
          period: periodoCompleto,
          status: response.data.status,
        };
      } else {
        this.valid = false;
      }
    } catch (error) {
      this.valid = false;
    } finally {
      this.loading = false;
    }
  }
}
