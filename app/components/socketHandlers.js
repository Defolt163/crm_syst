// socketHandlers.js
export function registerPassengerHandlers(socket, userId, setHasAccepted) {
    socket.on("orderUpdatedByDriver", (incomingUserId) => {
      if (incomingUserId === userId) {
        setHasAccepted(true);
      }
    });
  
    socket.on("driverPosition", (pos) => {
      if (pos.longitude !== null) {
        setDriverPos([pos.longitude, pos.latitude]);
      }
    });
  }
  
  export function registerDriverHandlers(socket, fetchOrders, checkDriverOrders, orderCreatedSound) {
    socket.on("orderCreated", () => {
      fetchOrders();
      orderCreatedSound?.play();
    });
  
    socket.on("orderUpdatedByDriver", () => {
      fetchOrders();
      checkDriverOrders?.();
    });
  }
  