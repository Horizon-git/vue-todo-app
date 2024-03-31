<script>
import * as todosApi from './api/todos';
import StatusFilter from './components/StatusFilter.vue';
import TodoItem from './components/TodoItem.vue';
import Message from './components/Message.vue';

export default {
  components: {
    StatusFilter,
    TodoItem,
    Message,
  },
  data() {
    return {
      todos: [],
      title: '',
      status: 'all',
      errorMessage: '',
      processingTodos: [],
      tempTodo: null,
    };
  },
  computed: {
    activeTodos() {
      return this.todos.filter(todo => !todo.completed);
    },
    completedTodos() {
      return this.todos.filter(todo => todo.completed);
    },
    visibleTodos() {
      switch (this.status) {
        case 'active':
          return this.activeTodos;

        case 'completed':
          return this.completedTodos;

        default:
          return this.todos;
      }
    }
  },
  mounted() {
    todosApi.getTodos()
      .then(({ data }) => this.todos = data)
      .catch(() => {
        this.errorMessage = 'Unable to load todos';
      });
  },
  methods: {
    addTodo() {
      const trimmedTitle = this.title.trim();
          if (!trimmedTitle) {
            this.errorMessage = 'You cant add  an empty todo!';
            return;
          }

      this.tempTodo = {
        id: -1,
        title: trimmedTitle,
        completed: false,
      }
      
      todosApi.createTodo(this.title)
        .then(({ data }) => {
          this.todos = [...this.todos, data];
          this.title = '';
          console.log(data.id);
        })
        .catch(() => {
          this.errorMessage ='Unable to create new todo';
        })
        .finally(() => {
          this.tempTodo = null;
        });
    },
    updateTodo({ id, title, completed }) {
      this.processingTodos.push(id);
      this.loader = true;
      todosApi.updateTodo({ id, title, completed })
        .then(({ data }) => {
          this.todos = this.todos.map(
            todo => todo.id !== id ? todo : data,
          );
        })
        .catch(() => {
          this.errorMessage ='Unable to update todo';
        })
        .finally(() => this.processingTodos = this.processingTodos.filter(
            todoID => id !== todoID,
          ));
    },
    deleteTodo(todoId) {
      this.processingTodos.push(todoId);
      todosApi.deleteTodo(todoId)
        .then(() => {
          this.todos = this.todos.filter(
            todo => todo.id !== todoId,
          );
        })
        .catch(() => {
          this.errorMessage = 'Unable to delete todo';
        })
        .finally(() => this.processingTodos = this.processingTodos.filter(
            todoID => todoId !== todoID,
          ));
    },
    clearCompleted() {
      this.completedTodos.forEach(todo => {
        this.deleteTodo(todo.id);
      });
    },
    toggleAllTodos() {
      const areAllCompleted = this.completedTodos.length === this.todos.length;
      const todosToUpdate = this.todos
        .filter((todo) => (areAllCompleted ? true : !todo.completed));

      this.processingTodos = todosToUpdate.map((todo) => todo.id);
      console.log(this.processingTodos);

      todosToUpdate.forEach(todo => {
          const updatedTodo = { ...todo, completed: !areAllCompleted };
          this.updateTodo(updatedTodo);
        });
    }
  },
};
</script>

<template>
  <div class="todoapp">
    <h1 class="todoapp__title">todos</h1>

    <div class="todoapp__content">
      <header class="todoapp__header">
        <button
          class="todoapp__toggle-all"
          :class="{ active: activeTodos.length === 0 }"
          v-if="todos.length"
          @click="toggleAllTodos"
        ></button>

        <form @submit.prevent="addTodo">
          <input
            type="text"
            class="todoapp__new-todo"
            placeholder="What needs to be done?"
            v-model.trim="title"
          />
        </form>
      </header>

      <TransitionGroup
        name="list"
        tag="section"
        class="todoapp__main"
      >
        <TodoItem
          v-for="todo, index of visibleTodos"
          :key="todo.id"
          :todo="todo"
          :processing-todos ="processingTodos"
          @update="updateTodo"
          @delete="deleteTodo(todo.id)"
        />

        <TodoItem
          v-if="tempTodo"
          :key="tempTodo.id"
          :todo="tempTodo"
        />

      </TransitionGroup>

      <footer v-if="todos.length > 0" class="todoapp__footer">
        <span class="todoapp__active-count">
          {{ activeTodos.length }} items left
        </span>

        <StatusFilter v-model="status" />

        <button
          @click="clearCompleted"
          class="todoapp__clear-completed"
          :class="{ 'visible': completedTodos.length }"
        >
          Clear completed
        </button>
      </footer>
    </div>

    <Message
      class="is-danger"
      :active="errorMessage !== ''"
      @hide="errorMessage = ''"
    >
      <template #default>
        <p>{{ errorMessage }}</p>
      </template>

      <template #header>
        <p>Error</p>
      </template>
    </Message>
  </div>
</template>

<style>
.list-enter-active,
.list-leave-active {
  max-height: 60px;
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  max-height: 0;
  transform: scaleY(0);
}
</style>