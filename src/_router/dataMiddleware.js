import transitionPath from 'router5-transition-path';

export default routes => router => (toState, fromState) => {
  const { toActivate } = transitionPath(toState, fromState);
  const onActivateHandlers = toActivate
    .map(segment =>
      routes.find(r => r.name === segment).onActivate(toState.params)
    )
    .filter(Boolean);

  return Promise.all(onActivateHandlers).then(data => {
    const routeData = data.reduce(
      (accData, rData) => Object.assign(accData, rData),
      {}
    );
    return { ...toState, data: routeData };
  });
};
