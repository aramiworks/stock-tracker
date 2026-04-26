// Extract JWT claims from context and forward as headers to subgraphs.
// Apollo Router 2.x stores validated JWT claims at
// "apollo::authentication::jwt_claims" as a JSON object.
// The `headers.all.request.insert.from_context` directive only supports
// top-level context keys (no nested field access), so a Rhai script is required.
fn subgraph_service(service, subgraph) {
    let request_callback = |request| {
        if request.context.contains("apollo::authentication::jwt_claims") {
            let claims = request.context["apollo::authentication::jwt_claims"];
            if claims != () {
                let sub = claims["sub"];
                if sub != () {
                    request.headers["x-user-id"] = sub.to_string();
                }
                let role = claims["role"];
                if role != () {
                    request.headers["x-user-role"] = role.to_string();
                }
            }
        }
    };
    service.map_request(request_callback);
}
