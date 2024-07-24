import React, { useState } from "react";
import ChatBot from "react-chatbotify";
import chatIcon from "../../assets/chatIcon.svg";
import { useAuth } from "../../services/authenticationContext/authentication.context";
import axiosInstance from "../../data/axiosConfig";
import Swal from "sweetalert2";
import useTranslation from "../../custom/useTranslation/useTranslation";

const ChatBotManager = () => {
  const [form, setForm] = useState({});
  const { user } = useAuth();
  const translate = useTranslation();

  const options = {
    header: {
      title: <h3>TaskMinderBot</h3>,
      avatar: chatIcon,
    },
    footer: {
      text: <p>{translate("bot_create")}</p>,
    },
    tooltip: {
      text: `${translate("bot_hello")} 😊`,
      style: {
        backgroundColor: "#007bff",
        color: "#ffffff",
        padding: "10px",
        borderRadius: "5px",
      },
    },
    chatHistory: {
      viewChatHistoryButtonText: translate("bot_history"),
    },
    hatInput: {
      enabledPlaceholderText: translate("bot_message"),
    },
    chatWindow: {
      messagePromptText: translate("bot_new_message"),
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

  const sendRequest = async (type, data) => {
    const url = type === "report" ? "/chat/send-report" : "/chat/contact-admin";
    try {
      await axiosInstance.post(url, data);
      Swal.fire({
        title: translate("success"),
        text: translate("bot_request"),
        icon: "success",
        confirmButtonText: translate("accept"),
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: translate("bot_err_request"),
        icon: "error",
        confirmButtonText: translate("accept"),
      });
    }
  };

  const flow = {
    start: {
      message: `${translate("text_hi")} ${user.UserName}, ${translate(
        "bot_help"
      )}`,
      options: [translate("bot_report"), translate("bot_contact")],
      chatDisabled: true,
      path: (params) => {
        if (params.userInput === translate("bot_report")) {
          return "report_problem";
        } else if (params.userInput === translate("bot_contact")) {
          return "contact_admin";
        }
      },
    },
    report_problem: {
      message: translate("bot_problem"),
      function: (params) => {
        setForm((prevForm) => ({ ...prevForm, reporte: params.userInput }));
      },
      path: "end_report",
    },
    contact_admin: {
      message: translate("bot_problem"),
      function: (params) => {
        setForm((prevForm) => ({
          ...prevForm,
          asunto: params.userInput,
          tiempoConsulta: getEstimatedResponseTime(),
        }));
      },
      path: "end_contact",
    },
    end_report: {
      message: translate("bot_thanks"),
      render: (
        <div style={formStyle}>
          <h4>{translate("bot_summary")}</h4>
          <p>
            <strong>{translate("bot_resume")}</strong> {form.reporte || "N/A"}
          </p>
          <p>
            <strong>{translate("bot_email")}</strong> {user.Email}
          </p>
          <button
            onClick={() =>
              sendRequest("report", { reportDetails: form.reporte })
            }
          >
            {translate("bot_send")}
          </button>
        </div>
      ),
      options: [translate("bot_new_query")],
      chatDisabled: true,
      path: "start",
    },
    end_contact: {
      message: translate("bot_thanks_send"),
      render: (
        <div style={formStyle}>
          <h4>{translate("bot_summary")}</h4>
          <p>
            <strong>{translate("bot_affair")}</strong> {form.asunto || "N/A"}
          </p>
          <p>
            <strong>{translate("bot_email")}</strong> {user.Email}
          </p>
          <p>
            <strong>{translate("bot_date")}</strong>{" "}
            {form.tiempoConsulta || "N/A"}
          </p>
          <button
            onClick={() =>
              sendRequest("contact", {
                subject: form.asunto,
                message: "Consulta enviada desde el chatbot",
                contactEmail: user.Email,
                estimatedResponseTime: form.tiempoConsulta,
              })
            }
          >
            {translate("bot_send_consult")}
          </button>
        </div>
      ),
      options: [translate("bot_new_query")],
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
