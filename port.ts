export namespace Port {
  export interface IUserPort {
    get_user_email(userId: string): Promise<string>
    get_user_password(email: string): Promise<string>
  }

  export interface IAttendancePort {
    attendance_in(email: string, password: string): Promise<void | Error>
    attendance_out(email: string, password: string): Promise<void | Error>
    start_break(email: string, password: string): Promise<void | Error>
    end_break(email: string, password: string): Promise<void | Error>
  }
}
