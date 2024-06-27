import React, { useState } from "react";
import ChatBot from "react-chatbotify";
import chatIcon from "../../assets/chatIcon.svg";
import { useAuth } from "../../services/authenticationContext/authentication.context";

const ChatBotManager = () => {
  const [form, setForm] = useState({});
  const { user } = useAuth();

  const options = {
    header: {
      title: <h3>TaskMinderBot</h3>,
      avatar: chatIcon,
    },
    footer: {
      text: <p>Creado por TaskMinder</p>,
    },
    tooltip: {
      text: "Hablame! 😊",
    },
    chatHistory: {
      viewChatHistoryButtonText: "Cargar Historial ⟳",
    },
    hatInput: {
      enabledPlaceholderText: "Escribe tu mensaje...",
    },
    chatWindow: {
      messagePromptText: "Nuevos mensajes ↓",
    },
    chatButton: {
      icon: chatIcon,
    },
    botBubble: {
      avatar: chatIcon,
    },
    notification: {
      disabled: false,
      defaultToggledOn: true,
      volume: 0.01,
      showCount: true,
    },
  };
  const formStyle = {
    border: "1px solid #491d8d",
    padding: "20px",
    borderRadius: "10px",
    maxWidth: "400px",
    backgroundColor: "#f8f9fa",
  };

  //Logica de horario
  const getEstimatedResponseTime = () => {
    const now = new Date();
    let estimatedTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;
    const isWorkingHour = (date) =>
      date.getHours() >= 8 && date.getHours() < 17;

    if (!isWorkingHour(estimatedTime) || isWeekend(estimatedTime)) {
      if (estimatedTime.getHours() >= 17) {
        estimatedTime.setHours(8, 0, 0, 0);
        estimatedTime.setDate(
          estimatedTime.getDate() + (estimatedTime.getDay() === 5 ? 3 : 1)
        );
      } else if (estimatedTime.getHours() < 8) {
        estimatedTime.setHours(8, 0, 0, 0);
      } else if (isWeekend(estimatedTime)) {
        estimatedTime.setHours(8, 0, 0, 0);
        estimatedTime.setDate(
          estimatedTime.getDate() + (estimatedTime.getDay() === 6 ? 2 : 1)
        );
      }
    }

    return estimatedTime.toLocaleString();
  };

  const flow = {
    start: {
      message: `Hola ${user.UserName}, ¿en qué puedo ayudarte?`,
      options: ["Reportar problema", "Contactar con admin"],
      chatDisabled: true,
      path: (params) => {
        if (params.userInput === "Reportar problema") {
          return "report_problem";
        } else if (params.userInput === "Contactar con admin") {
          return "contact_admin";
        }
      },
    },
    report_problem: {
      message: "¿Cuál es el problema? Descríbelo.",
      function: (params) => {
        setForm((prevForm) => ({ ...prevForm, reporte: params.userInput }));
      },
      path: "end_report",
    },
    contact_admin: {
      message: "¿Cuál es el asunto? Descríbelo.",
      function: (params) => {
        setForm((prevForm) => ({
          ...prevForm,
          asunto: params.userInput,
          tiempoConsulta: new Date(),
        }));
      },
      path: "end_contact",
    },
    end_report: {
      message: "Gracias por tu reporte, pronto tendrás una respuesta.",
      render: (
        <div style={formStyle}>
          <h4>Resumen de la Aplicación</h4>
          <p>
            <strong>Reporte:</strong> {form.reporte || "N/A"}
          </p>
          <p>
            <strong>Email de contacto:</strong> {user.Email}
          </p>
        </div>
      ),
      options: ["Nueva Consulta"],
      chatDisabled: true,
      path: "start",
    },
    end_contact: {
      message:
        "Gracias por tu mensaje, ya se envió la solicitud al admin, pronto se contactará contigo.",
      render: (
        <div style={formStyle}>
          <h4>Resumen de la Aplicación</h4>
          <p>
            <strong>Asunto:</strong> {form.asunto || "N/A"}
          </p>
          <p>
            <strong>Email de contacto:</strong> {user.Email}
          </p>
          <p>
            <strong>Fecha estimada de respuesta:</strong>{" "}
            {getEstimatedResponseTime()}
          </p>
        </div>
      ),
      options: ["Nueva Consulta"],
      chatDisabled: true,
      path: "start",
    },
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <ChatBot options={options} flow={flow} />
        </div>
      </div>
    </div>
  );
};

export default ChatBotManager;
