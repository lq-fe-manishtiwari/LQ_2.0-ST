import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

class AttendanceWebSocketService {
    constructor() {
        this.stompClient = null;
        this.isConnected = false;
        this.subscriptions = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
    }

    /**
     * Connect to WebSocket server
     * @param {string} serverUrl - WebSocket server URL
     * @param {string} authToken - Bearer token for authentication
     * @param {function} onConnected - Callback when connected
     * @param {function} onError - Callback on error
     */
    connect(serverUrl, authToken, onConnected, onError) {
        if (this.isConnected) {
            console.log('WebSocket already connected');
            return;
        }

        try {
            // Create WebSocket URL with auth token in query param
            const wsUrl = `${serverUrl}/ws/attendance?access_token=${authToken}`;

            // SockJS options - prefer WebSocket transport
            const sockJsOptions = {
                transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
                timeout: 10000
            };

            console.log('🔌 Creating SockJS connection:', {
                url: wsUrl,
                transports: sockJsOptions.transports
            });

            const socket = new SockJS(wsUrl, null, sockJsOptions);

            // Log transport being used
            socket.onopen = function () {
                console.log('✅ SockJS connection opened');
                console.log('🚀 Using transport:', socket.protocol);
            };

            socket.onclose = function (e) {
                console.log('🔌 SockJS connection closed:', e);
            };

            this.stompClient = Stomp.over(socket);

            // Disable debug logging in production
            this.stompClient.debug = (msg) => {
                if (import.meta.env.MODE === 'development') {
                    console.log('[WebSocket]', msg);
                }
            };

            const headers = {
                'Authorization': `Bearer ${authToken}`
            };

            this.stompClient.connect(
                headers,
                (frame) => {
                    console.log('✅ WebSocket Connected:', frame);
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    if (onConnected) onConnected(frame);
                },
                (error) => {
                    console.error('❌ WebSocket Connection Error:', error);
                    this.isConnected = false;
                    if (onError) onError(error);
                    this.handleReconnect(serverUrl, authToken, onConnected, onError);
                }
            );
        } catch (error) {
            console.error('❌ WebSocket Setup Error:', error);
            if (onError) onError(error);
        }
    }

    /**
     * Handle reconnection logic
     */
    handleReconnect(serverUrl, authToken, onConnected, onError) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

            setTimeout(() => {
                this.connect(serverUrl, authToken, onConnected, onError);
            }, this.reconnectDelay);
        } else {
            console.error('❌ Max reconnection attempts reached');
        }
    }

    /**
     * Subscribe to attendance updates for a session
     * @param {object} sessionKey - Session parameters
     * @param {function} onMessage - Callback when message received
     * @returns {string} Subscription ID
     */
    subscribeToSession(sessionKey, onMessage) {
        if (!this.isConnected || !this.stompClient) {
            console.error('❌ Cannot subscribe: WebSocket not connected');
            return null;
        }

        const {
            academic_year_id,
            semester_id,
            division_id,
            subject_id,
            timetable_id,
            timetable_allocation_id,
            date,
            time_slot_id
        } = sessionKey;

        // Build topic path
        const topic = `/topic/attendance/${academic_year_id}/${semester_id}/${division_id}/${subject_id}/${timetable_id}/${timetable_allocation_id}/${date}/${time_slot_id}`;

        console.log('📡 Subscribing to topic:', topic);

        try {
            // Subscribe to topic
            const subscription = this.stompClient.subscribe(topic, (message) => {
                console.log('📬 Raw message received:', message);
                try {
                    const data = JSON.parse(message.body);
                    console.log('📨 Parsed message data:', data);
                    if (onMessage) {
                        console.log('🔔 Calling onMessage callback with data:', data);
                        onMessage(data);
                    } else {
                        console.warn('⚠️ No onMessage callback defined');
                    }
                } catch (error) {
                    console.error('❌ Error parsing message:', error);
                    console.error('Raw message body:', message.body);
                }
            });

            // Store subscription
            const subscriptionId = `${topic}`;
            this.subscriptions.set(subscriptionId, subscription);
            console.log('✅ Subscription stored with ID:', subscriptionId);

            return subscriptionId;
        } catch (error) {
            console.error('❌ Subscription error:', error);
            return null;
        }
    }

    /**
     * Unsubscribe from a specific topic
     * @param {string} subscriptionId - Subscription ID to unsubscribe
     */
    unsubscribe(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(subscriptionId);
            console.log('🔕 Unsubscribed from:', subscriptionId);
        }
    }

    /**
     * Disconnect WebSocket
     */
    disconnect() {
        if (this.stompClient && this.isConnected) {
            // Unsubscribe all
            this.subscriptions.forEach((subscription) => {
                subscription.unsubscribe();
            });
            this.subscriptions.clear();

            this.stompClient.disconnect(() => {
                console.log('🔌 WebSocket Disconnected');
            });

            this.isConnected = false;
            this.stompClient = null;
        }
    }

    /**
     * Check if connected
     */
    getConnectionStatus() {
        return this.isConnected;
    }
}

// Export singleton instance
export const attendanceWebSocket = new AttendanceWebSocketService();
