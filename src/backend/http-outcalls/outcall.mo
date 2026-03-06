import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Array "mo:core/Array";
import IC "ic:aaaaa-aa";

module {
  public func transform(input : TransformationInput) : TransformationOutput {
    let response = input.response;
    {
      response with headers = [];
    };
  };

  public type TransformationInput = {
    context : Blob;
    response : IC.http_request_result;
  };
  public type TransformationOutput = IC.http_request_result;
  public type Transform = query TransformationInput -> async TransformationOutput;
  public type Header = {
    name : Text;
    value : Text;
  };

  let httpRequestCycles = 231_000_000_000;

  public func httpGetRequest(url : Text, extraHeaders : [Header], transform : Transform) : async Text {
    let headers = extraHeaders.concat([{
      name = "User-Agent";
      value = "caffeine.ai";
    }]);
    let http_request : IC.http_request_args = {
      url;
      max_response_bytes = null;
      headers;
      body = null;
      method = #get;
      transform = ?{
        function = transform;
        context = Blob.fromArray([]);
      };
      is_replicated = ?false;
    };
    let httpResponse = await (with cycles = httpRequestCycles) IC.http_request(http_request);
    switch (httpResponse.body.decodeUtf8()) {
      case (null) { Runtime.trap("empty HTTP response") };
      case (?decodedResponse) { decodedResponse };
    };
  };

  public func httpPostRequest(url : Text, extraHeaders : [Header], body : Text, transform : Transform) : async Text {
    let headers = extraHeaders.concat([
      { name = "User-Agent"; value = "caffeine.ai" },
      { name = "Idempotency-Key"; value = "Time-" # Time.now().toText() },
    ]);
    let requestBody = body.encodeUtf8();
    let httpRequest : IC.http_request_args = {
      url;
      max_response_bytes = null;
      headers;
      body = ?requestBody;
      method = #post;
      transform = ?{
        function = transform;
        context = Blob.fromArray([]);
      };
      is_replicated = ?false;
    };
    let httpResponse = await (with cycles = httpRequestCycles) IC.http_request(httpRequest);
    switch (httpResponse.body.decodeUtf8()) {
      case (null) { Runtime.trap("empty HTTP response") };
      case (?decodedResponse) { decodedResponse };
    };
  };
};
