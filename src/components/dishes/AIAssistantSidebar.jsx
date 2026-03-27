import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader, Sparkles, User, Bot, Copy, Code, Clock, UtensilsCrossed, ShoppingCart, ChefHat } from 'lucide-react';
import { mistralApi } from '../../lib/mistral';
import { useToast } from '../../hooks/useToast';

function ProposalCard({ data }) {
  const { name, description, ingredients, instructions, prep_time_minutes, cook_time_minutes } = data;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h4 className="font-semibold text-gray-900 text-base">{name}</h4>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>

      {/* Times */}
      {(prep_time_minutes || cook_time_minutes) && (
        <div className="flex gap-3">
          {prep_time_minutes > 0 && (
            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
              <Clock className="h-3 w-3" />
              Prep: {prep_time_minutes} min
            </span>
          )}
          {cook_time_minutes > 0 && (
            <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
              <Clock className="h-3 w-3" />
              Cocción: {cook_time_minutes} min
            </span>
          )}
        </div>
      )}

      {/* Ingredients */}
      {ingredients && ingredients.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <UtensilsCrossed className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ingredientes</span>
          </div>
          <div className="space-y-1">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm py-1 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-800">
                    {ing.amount} {ing.unit}
                  </span>
                  <span className="text-gray-600"> {ing.ingredient}</span>
                </div>
                <span className="flex-shrink-0 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                  {ing.food_group_name} ({ing.food_group_portions}p)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shopping summary */}
      {ingredients && ingredients.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <ShoppingCart className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Lista de compra</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ingredients.map((ing, idx) => (
              ing.shopping_list_conversion && (
                <span key={idx} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                  {ing.shopping_list_conversion.amount} {ing.shopping_list_conversion.unit} {ing.shopping_list_conversion.name}
                </span>
              )
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {instructions && instructions.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <ChefHat className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Instrucciones</span>
          </div>
          <ol className="space-y-1.5">
            {instructions.map((step, idx) => (
              <li key={idx} className="flex gap-2 text-sm">
                <span className="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-medium">
                  {step.step || idx + 1}
                </span>
                <span className="text-gray-700 leading-snug">{step.instruction}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function AIAssistantSidebar({
  isOpen,
  onClose,
  dishData,
  onUpdateDish,
  foodGroups,
  exchangeList = [],
  patientContext = null,
  targetPortions = {},
  mealTime = null
}) {
  const { error: showError, success: showSuccess } = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const hasInitialized = useRef(false);
  const debugLogs = useRef([]);

  useEffect(() => {
    if (isOpen && !hasInitialized.current) {
      setMessages([{
        role: 'assistant',
        content: '¡Hola! Soy tu asistente de nutrición. Puedo ayudarte a crear o editar tu plato. ¿Qué te gustaría hacer hoy?',
        timestamp: Date.now()
      }]);
      hasInitialized.current = true;
    }

    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addDebugLog = (type, message, data = null) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      message,
      data
    };
    debugLogs.current.push(logEntry);
    console.log(`[${type}]`, message, data || '');
  };

  const parseJsonResponse = (content) => {
    // The AI should respond with pure JSON only
    const trimmed = content.trim();

    try {
      const parsed = JSON.parse(trimmed);
      addDebugLog('DATA', 'Parsed JSON response', parsed);
      return parsed;
    } catch (e) {
      // Fallback: try to extract JSON from response if AI added extra text
      const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          addDebugLog('DATA', 'Extracted JSON from response', parsed);
          return parsed;
        } catch (e2) {
          addDebugLog('ERROR', 'Failed to parse JSON', { error: e2.message, content: trimmed.substring(0, 200) });
        }
      }
      // If completely fails to parse, treat as chat message
      addDebugLog('WARN', 'Response is not JSON, treating as chat', { content: trimmed.substring(0, 200) });
      return { action: 'chat', message: trimmed };
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.rawContent || msg.content
      }));

      conversationHistory.push({
        role: 'user',
        content: userMessage.content
      });

      addDebugLog('INFO', 'Food groups passed to AI', foodGroups.map(g => ({ name: g.name, id: g.id })));

      const systemPrompt = mistralApi.createDishAssistantPrompt(
        dishData,
        foodGroups,
        exchangeList,
        patientContext,
        targetPortions,
        mealTime
      );

      // Add temporary loading message
      const tempMessageId = Date.now() + 1;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        timestamp: tempMessageId,
        isStreaming: true
      }]);

      addDebugLog('INFO', 'Starting streaming from Mistral API');

      const streamedContent = await mistralApi.streamChat(
        conversationHistory,
        systemPrompt,
        (chunk, fullContent) => {
          // During streaming, just show thinking indicator (JSON isn't readable mid-stream)
          setMessages(prev => prev.map(msg =>
            msg.timestamp === tempMessageId
              ? { ...msg, isStreaming: true }
              : msg
          ));
        }
      );

      addDebugLog('DATA', 'Streaming complete - Full response', streamedContent);

      // Parse the JSON response
      const parsed = parseJsonResponse(streamedContent);

      if (parsed.action === 'update_dish' && parsed.data) {
        // Validate ingredients
        if (parsed.data.ingredients && parsed.data.ingredients.length > 0) {
          parsed.data.ingredients.forEach((ing, idx) => {
            if (!ing.unit) addDebugLog('WARN', `Missing unit for ingredient ${idx}`, ing.ingredient);
            if (typeof ing.food_group_portions !== 'number') {
              addDebugLog('WARN', `Missing or invalid food_group_portions for ingredient ${idx}`, ing.ingredient);
            }
            if (!ing.shopping_list_conversion) {
              addDebugLog('WARN', `Missing shopping_list_conversion for ingredient ${idx}`, ing.ingredient);
            }
            if (!ing.food_group_id) {
              addDebugLog('WARN', `Missing food_group_id for ingredient ${idx}`, ing.ingredient);
            }
          });
        }

        // Show proposal card
        setMessages(prev => prev.map(msg =>
          msg.timestamp === tempMessageId
            ? {
                ...msg,
                content: '',
                rawContent: streamedContent,
                isStreaming: false,
                isProposal: true,
                proposalData: parsed.data,
                pendingAction: parsed,
                pendingActionId: Date.now()
              }
            : msg
        ));
      } else {
        // Chat message
        const chatText = parsed.message || parsed.content || streamedContent;
        setMessages(prev => prev.map(msg =>
          msg.timestamp === tempMessageId
            ? {
                ...msg,
                content: chatText,
                rawContent: streamedContent,
                isStreaming: false
              }
            : msg
        ));
      }

    } catch (err) {
      addDebugLog('ERROR', 'Error calling AI assistant', { error: err.message, stack: err.stack });
      showError('Error al comunicarse con el asistente. Verifica tu API key.');
      setMessages(prev => prev.filter(msg => !msg.isStreaming));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleApplyProposal = async (pendingActionId) => {
    const message = messages.find(msg => msg.pendingActionId === pendingActionId);
    if (!message || !message.pendingAction) return;

    const action = message.pendingAction;

    setMessages(prev => prev.map(msg =>
      msg.pendingActionId === pendingActionId
        ? { ...msg, isProposal: false, isApplied: true }
        : msg
    ));

    onUpdateDish({
      ...dishData,
      ...action.data
    });

    showSuccess('Cambios aplicados al plato');
  };

  const handleRejectProposal = (pendingActionId) => {
    setMessages(prev => prev.map(msg =>
      msg.pendingActionId === pendingActionId
        ? { ...msg, isProposal: false }
        : msg
    ).concat({
      role: 'assistant',
      content: 'De acuerdo, no aplicaré esos cambios. ¿Qué te gustaría modificar?',
      timestamp: Date.now()
    }));
  };

  const handleCopyLog = async () => {
    try {
      const log = {
        timestamp: new Date().toISOString(),
        dishData: dishData,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          rawContent: msg.rawContent,
          timestamp: msg.timestamp,
          isProposal: msg.isProposal || false,
          isApplied: msg.isApplied || false,
          proposalData: msg.proposalData,
          pendingAction: msg.pendingAction
        })),
        debugLogs: debugLogs.current,
        foodGroups: foodGroups.map(g => ({ id: g.id, name: g.name }))
      };

      const logString = JSON.stringify(log, null, 2);
      await navigator.clipboard.writeText(logString);
      showSuccess('Log copiado al portapapeles');
    } catch (error) {
      addDebugLog('ERROR', 'Error copying log', { error: error.message });
      showError('Error al copiar el log');
    }
  };

  const handleShowLastResponse = () => {
    const lastActionMessage = [...messages].reverse().find(msg => msg.pendingAction);

    if (lastActionMessage) {
      const jsonString = JSON.stringify(lastActionMessage.pendingAction, null, 2);
      setMessages(prev => prev.concat({
        role: 'assistant',
        content: `\`\`\`json\n${jsonString}\n\`\`\``,
        timestamp: Date.now()
      }));
    } else {
      showError('No hay respuestas JSON disponibles');
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-[500px] max-w-[45vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[60] flex flex-col border-l-2 border-emerald-200 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Asistente IA</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShowLastResponse}
                className="text-white hover:text-gray-200 transition-colors p-1 rounded hover:bg-white/10"
                title="Ver JSON de última respuesta"
              >
                <Code className="h-4 w-4" />
              </button>
              <button
                onClick={handleCopyLog}
                className="text-white hover:text-gray-200 transition-colors p-1 rounded hover:bg-white/10"
                title="Copiar log de conversación"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <p className="text-emerald-100 text-sm mt-1">
            Powered by Mistral AI
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.timestamp}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                {/* Loading state */}
                {message.isStreaming ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Pensando...</span>
                  </div>
                ) : message.proposalData ? (
                  <>
                    {/* Proposal card */}
                    <ProposalCard data={message.proposalData} />

                    {/* Applied badge */}
                    {message.isApplied && (
                      <div className="mt-3 pt-2 border-t border-green-200">
                        <span className="text-xs text-green-600 font-medium">
                          Cambios aplicados al plato
                        </span>
                      </div>
                    )}

                    {/* Confirm/reject buttons */}
                    {message.isProposal && message.pendingAction && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                        <button
                          onClick={() => handleApplyProposal(message.pendingActionId)}
                          disabled={isLoading}
                          className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                        >
                          {isLoading ? (
                            <>
                              <Loader className="h-3 w-3 animate-spin" />
                              Aplicando...
                            </>
                          ) : (
                            'Aplicar cambios'
                          )}
                        </button>
                        <button
                          onClick={() => handleRejectProposal(message.pendingActionId)}
                          disabled={isLoading}
                          className="flex-1 px-3 py-2 text-gray-700 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          Modificar
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  /* Regular text message */
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                )}
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4 bg-white">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje... (Enter para enviar)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Shift + Enter para nueva línea
          </p>
        </div>
      </div>
    </>
  );
}
