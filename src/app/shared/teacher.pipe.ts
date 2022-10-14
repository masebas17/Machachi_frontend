import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'teacher'
})
export class TeacherPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if(value === null){
      return 'No Asignado';
    }
  }

}
