import {IInputs, IOutputs} from "./generated/ManifestTypes";
import * as signalR from "@aspnet/signalr";

export class SignalRClient implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private notifyOutputChanged: () => void;

	private signalRConnectionString: string;
	private hubConnection: signalR.HubConnection;

	private messageElement: HTMLDivElement;
	private inputElement: HTMLInputElement;
	private buttonSend: HTMLButtonElement;
	private receivedMessage: Message;
	private latestMessage: Message;
	/**
	 * Empty constructor.
	 */
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		// Add control initialization code
		this.notifyOutputChanged = notifyOutputChanged;

		this.messageElement = document.createElement("div");
		container.append(this.messageElement);
		this.inputElement = document.createElement("input");
		this.inputElement.setAttribute("id", "inputText");
		container.append(this.inputElement);
		this.buttonSend = document.createElement("button");
		this.buttonSend.addEventListener("click", this.sendMessage);
		container.append(this.buttonSend);

		this.hubConnection = new signalR.HubConnectionBuilder()
		.withUrl("http://localhost:7071/api")
		.configureLogging(signalR.LogLevel.Information)
		.build();

		this.hubConnection.start();

		this.hubConnection.on("newMessage", (message:Message) => {
			this.receivedMessage = message;
			this.notifyOutputChanged();
			//this.processMessagemessage
		});
 	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Add code to update control view
		this.signalRConnectionString = context.parameters.signalRConnectionString.raw ? context.parameters.signalRConnectionString.raw : "";


	}

	private processMessage(message: Message) {
		this.messageElement.innerHTML = JSON.stringify(message);
	}

	private sendMessage() {
		var xhr = new XMLHttpRequest();
		xhr.open("post", "http://localhost:7071/api/messages", true);
		
		var inputElem = document.getElementById("inputText") as HTMLInputElement;
		if (inputElem != null) {
			xhr.setRequestHeader('Content-Type', 'application/json');
			//xhr.send(JSON.stringify(inputElem.value));
			xhr.send('{ sender: "pcf", text: "' + inputElem.value + '" }');
		}
		else xhr.send();
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		console.log(this.receivedMessage);
		return {};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
		this.hubConnection.stop();
	}
}

class Message
{
	constructor() {}
	public Sender: string;
	public Text: string;
	public Type: string;
}