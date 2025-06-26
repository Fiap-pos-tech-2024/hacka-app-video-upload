export interface IMensageria {
   sendMessage<T>(queueUrl: string, message: T): Promise<void>
   receiveMessages<T>(queueUrl: string): Promise<{ message: T; receiptHandles: string }[]>
   deleteMessage(queueUrl: string, receiptHandle: string): Promise<void>
}