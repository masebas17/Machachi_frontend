export interface LevelResponse {
    correctProcess: boolean,
    error: null,
    message: string,
    data: [datalevel]
}

export interface datalevel {
    id: number,
    name: string 
}

export interface shedule{
    correctProcess: boolean,
    error: null,
    message: string,
    data: [datashedule],

}
export interface datashedule {
    id: number,
    weekDay: string,
    startTime: number,
    endTime: number,
    level: [datalevel]
}

export interface course{
    correctProcess: boolean,
    error: null,
    message: "Cursos encontrados",
    data: [datacourses]
}

export interface datacourses{
    id: number,
    name: string,
    maxStudents: number,
    Schedule: [datashedule],
    Students: [dataStudent]
}


export interface Students{
    correctProcess: boolean,
    error: null,
    message: "Matriculación exitosa",
    data: [dataStudent]
}

export interface dataStudent{
    id?: number,
    name?: string,
    lastName?: string,
    age?: number,
    identityNumber?: number,
    parentName?: string,
    address?: string,
    phone1?: number,
    email?: string,
    baptized?: false,
    disability?: null,
    courseId?: number
}