<script setup>
import { onMounted, ref } from 'vue';
import { addList, getUsers } from '../switchboard';

// Page Status
const isReady = ref(false);
const error = ref(null);
const createdList = ref(null);

// Form Data
const name = ref('');
const userId = ref('');
const active = ref(true);

// Data dependencies
const usersList = ref([]);

onMounted(async () => {
  try {
    usersList.value = await getUsers();
    if (usersList.value.length) {
      userId.value = usersList.value[0].id;
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    isReady.value = true;
  }
});

/**
 * Handles Form Submit
 */
const onSubmit = async () => {
  try {
    error.value = null;
    createdList.value = await addList({
      name: name.value,
      userId: userId.value,
      active: active.value,
    });
    name.value = '';
  } catch (err) {
    error.value = err.message;
  }
};
</script>

<template>
  <div class="list-add-view">
    <div v-if="!isReady">Loading...</div>
    <form v-else @submit.prevent="onSubmit" novalidate>
      <fieldset>
        <legend>Add a List</legend>
        <p>
          <label for="name">Name: <span aria-label="required">*</span></label>
          <input id="name" type="text" name="name" v-model="name" required>
        </p>
        <p>
          <label for="userId">Owner: <span aria-label="required">*</span></label>
          <select name="userId" id="userId" v-model="userId">
            <option v-for="user in usersList" :key="user.id" :value="user.id">{{ user.username }}</option>
          </select>
        </p>
        <p>
          <label for="active">
            <input type="checkbox" v-model="active" id="active" name="active"> Active
          </label>
        </p>
        <p>
          <button type="submit">Add List</button>
        </p>
      </fieldset>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
    <div v-if="createdList">
      <p>Created list <strong>{{ createdList.name }}</strong>. Set <code>listId</code> in <code>frontend/src/config.json</code> to:</p>
      <pre>{{ createdList.id }}</pre>
    </div>
  </div>
</template>

<style scoped>
.list-add-view {
  padding: 16px;
}

.error {
  color: red;
}

p {
  margin: .5em 0;
}
</style>
