<script setup>
import CloseIcon from './icons/CloseIcon.vue';
defineProps({
  details: {
    type: Object,
  },
});
</script>

<template>
  <Transition name="modal" duration="300">
    <div class="voting-started-modal" v-if="details">
      <div class="protection" @click="$emit('close')"></div>
      <div class="modal">
        <button class="btn-close" @click="$emit('close')">
          <CloseIcon />
        </button>
        <h2>Round {{ details.round }} CLOSED</h2>
        <h3>Your winner is...</h3>
        <div class="winner">
          <img :src="details.winner.securePosterUrl" alt="" />
          <div class="title">{{ details.winner.title }}</div>
        </div>
        <router-link class="cta" :to="{ name: 'voting' }" @click="$emit('close')">See the Results</router-link>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.voting-started-modal {
  height: 100vh;
  left: 0;
  padding: 120px 40px 0;
  position: fixed;
  top: 0;
  z-index: 6000;
  width: 100%;
}

.protection {
  backdrop-filter: blur(3px);
  background: rgba(0, 0, 0, 0.25);
  height: 100dvh;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
}

.modal {
  background: white;
  border-radius: 16px;
  color: #333;
  padding: 32px;
  position: relative;
  text-align: center;
}

.btn-close {
  appearance: none;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 8px;
  padding: 3px;
  position: absolute;
  left: 16px;
  top: 16px;
}

.btn-close svg {
  height: 16px;
  width: 16px;
}

h2 {
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
}

h3 {
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -1px;
  line-height: 1;
  margin-top: 2px;
}

.winner img {
  border-radius: 8px;
  display: block;
  margin: 4px auto 0;
  width: 100%;
}

.title {
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
  margin-top: 8px;
}

.cta {
  background: #FF7518;
  border-radius: 8px;
  display: block;
  color: white;
  font-weight: 900;
  text-decoration: none;
  padding: 6px;
  margin: 16px auto 0;
  width: 80%;
}

.modal-enter-active .protection,
.modal-leave-active .protection {
  transition: opacity 300ms;
}

.modal-enter-from .protection,
.modal-leave-to .protection {
  opacity: 0;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: opacity 300ms, transform 300ms;

}

.modal-enter-from .modal,
.modal-leave-to .modal {
  opacity: 0;
  transform: translateY(24px);
}
</style>