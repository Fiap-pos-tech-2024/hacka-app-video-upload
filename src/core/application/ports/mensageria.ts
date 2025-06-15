export interface IMensageria {
   sendMessage<T>(queueUrl: string, message: T): Promise<void>
}