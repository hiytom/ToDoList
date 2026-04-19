export type Todo = {
  id: string;
  title: string;
  createdAt: number;
  doneAt?: number;
};

export type UndoAction = {
  todoId: string;
  prevDoneAt?: number;
};

export type EditableTodo = Todo;
